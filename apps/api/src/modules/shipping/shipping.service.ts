import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { cepToInt, normalizeCep, isValidCep } from "../../common/cep.util";

@Injectable()
export class ShippingService {
  constructor(private readonly prisma: PrismaService) {}

  async quoteByCep(rawCep: string): Promise<{
    cep: string;
    zoneCode: string;
    zoneName: string;
    price: number;
    matchedRange: { start: string; end: string };
  }> {
    const cep = normalizeCep(rawCep);
    if (!isValidCep(cep)) {
      throw new BadRequestException(`CEP inválido: ${rawCep}`);
    }

    const cepInt = cepToInt(cep);

    // Busca ranges ativos que cobrem o CEP
    const ranges = await this.prisma.shippingZoneCepRange.findMany({
      where: {
        active: true,
        deletedAt: null,
        cepStartInt: { lte: cepInt },
        cepEndInt: { gte: cepInt },
      },
      include: { zone: true },
      orderBy: [
        { zone: { priority: "desc" } },
        { spanInt: "asc" },
        { zone: { price: "asc" } },
      ],
    });

    if (!ranges.length) {
      throw new BadRequestException(`Nenhuma zona de frete encontrada para o CEP ${cep}`);
    }

    const winner = ranges[0];
    return {
      cep,
      zoneCode: winner.zone.code,
      zoneName: winner.zone.name,
      price: Number(winner.zone.price),
      matchedRange: { start: winner.cepStart, end: winner.cepEnd },
    };
  }
}
