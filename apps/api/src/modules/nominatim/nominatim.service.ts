import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class NominatimService {
  constructor(private readonly prisma: PrismaService) {}

  async geocodeCep(cep: string): Promise<{ lat: number; lng: number } | null> {
    const key = `cep:${cep}`;

    // 1. Verificar cache no DB
    const cached = await this.prisma.geoCache.findUnique({ where: { key } });
    if (cached) {
      return { lat: cached.lat, lng: cached.lng };
    }

    // 2. Chamar Nominatim
    try {
      const url = `https://nominatim.openstreetmap.org/search?postalcode=${cep}&country=BR&format=json&limit=1`;
      const headers = {
        "User-Agent": process.env.GEOCODER_USER_AGENT || "sp-importadora/1.0",
        "Accept-Language": "pt-BR",
      };

      const res = await fetch(url, { headers });
      const data = await res.json();

      if (!data || !data.length) return null;

      const { lat, lon } = data[0];
      const result = { lat: parseFloat(lat), lng: parseFloat(lon) };

      // 3. Salvar no cache
      await this.prisma.geoCache.upsert({
        where: { key },
        update: { lat: result.lat, lng: result.lng },
        create: { key, lat: result.lat, lng: result.lng, provider: "nominatim" },
      });

      // 4. Rate limiting (respeitar política Nominatim: 1 req/s)
      await new Promise((r) =>
        setTimeout(r, parseInt(process.env.GEOCODER_RATE_LIMIT_MS || "1100", 10)),
      );

      return result;
    } catch (err) {
      console.error("[NominatimService] Erro ao geocodificar CEP:", cep, err);
      return null;
    }
  }
}
