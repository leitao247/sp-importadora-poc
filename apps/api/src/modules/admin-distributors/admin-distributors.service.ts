import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { randomBytes } from "crypto";

@Injectable()
export class AdminDistributorsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.distributor.findMany({ orderBy: { name: "asc" } });
  }

  async rotateKey(code: string) {
    const newKey = randomBytes(24).toString("hex");
    const updated = await this.prisma.distributor.update({
      where: { code },
      data: { apiKey: newKey },
    });
    return { code: updated.code, name: updated.name, newApiKey: newKey };
  }
}
