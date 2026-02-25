import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query?: string) {
    return this.prisma.product.findMany({
      where: {
        active: true,
        ...(query
          ? {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { code: { contains: query, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        code: true,
        name: true,
        priceBox: true,
        priceUnit: true,
        unitsPerBox: true,
        bottleMl: true,
      },
    });
  }

  async findByCode(code: string) {
    return this.prisma.product.findUnique({
      where: { code },
      select: {
        id: true,
        code: true,
        name: true,
        priceBox: true,
        priceUnit: true,
        unitsPerBox: true,
        bottleMl: true,
        active: true,
      },
    });
  }
}
