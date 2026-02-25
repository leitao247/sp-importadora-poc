import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NominatimService } from "../nominatim/nominatim.service";
import { ShippingService } from "../shipping/shipping.service";
import { haversineKm } from "../../common/distance.util";
import { normalizeCep, isValidCep } from "../../common/cep.util";
import { env } from "../../env";

@Injectable()
export class RoutingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly nominatim: NominatimService,
    private readonly shipping: ShippingService,
  ) {}

  async quote(rawCep: string) {
    const cep = normalizeCep(rawCep);
    if (!isValidCep(cep)) throw new BadRequestException(`CEP inválido: ${rawCep}`);

    // 1. Geocodificar CEP do cliente
    const geo = await this.nominatim.geocodeCep(cep);
    if (!geo) throw new BadRequestException(`Não foi possível geocodificar o CEP ${cep}`);

    // 2. Buscar distribuidores ativos com coordenadas
    const distributors = await this.prisma.distributor.findMany({
      where: { active: true, lat: { not: null }, lng: { not: null } },
    });

    if (!distributors.length) {
      throw new BadRequestException("Nenhum distribuidor disponível");
    }

    // 3. Calcular distâncias e filtrar por raio
    const maxKm = env.ROUTING_DEFAULT_MAX_KM;
    const candidates = distributors
      .map((d) => ({
        ...d,
        distanceKm: haversineKm(geo.lat, geo.lng, d.lat!, d.lng!),
      }))
      .filter((d) => {
        const radius = d.serviceRadiusKm ?? maxKm;
        return d.distanceKm <= radius;
      })
      .sort((a, b) => {
        if (a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm;
        return b.priority - a.priority;
      });

    if (!candidates.length) {
      throw new BadRequestException(`Nenhum distribuidor cobre o CEP ${cep} (raio máximo: ${maxKm} km)`);
    }

    const chosen = candidates[0];

    // 4. Calcular frete
    let shipping = null;
    try {
      shipping = await this.shipping.quoteByCep(cep);
    } catch {
      // frete não obrigatório para roteamento
    }

    return {
      cep,
      customerCoords: geo,
      chosenDistributor: {
        id: chosen.id,
        code: chosen.code,
        name: chosen.name,
        distanceKm: chosen.distanceKm,
        priority: chosen.priority,
        emitsNf: chosen.emitsNf,
      },
      candidates: candidates.slice(0, 10).map((c) => ({
        code: c.code,
        name: c.name,
        distanceKm: c.distanceKm,
        priority: c.priority,
      })),
      shipping,
    };
  }
}
