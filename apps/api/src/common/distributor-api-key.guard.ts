import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../modules/prisma/prisma.service";

@Injectable()
export class DistributorApiKeyGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const code = request.headers["x-distributor-code"];
    const key = request.headers["x-distributor-key"];

    if (!code || !key) {
      throw new UnauthorizedException("Código e chave do distribuidor são obrigatórios.");
    }

    const distributor = await this.prisma.distributor.findFirst({
      where: { code, apiKey: key, active: true },
    });

    if (!distributor) {
      throw new UnauthorizedException("Distribuidor não encontrado ou chave inválida.");
    }

    // Injeta no request para uso posterior
    request.distributor = distributor;
    return true;
  }
}
