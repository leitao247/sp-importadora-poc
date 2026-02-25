import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { env } from "../../env";

@Injectable()
export class AdminApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const key = request.headers["x-admin-key"];
    if (!key || key !== env.ADMIN_API_KEY) {
      throw new UnauthorizedException("Chave de admin inválida ou ausente.");
    }
    return true;
  }
}
