import { Controller, Get, Post, Param, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { AdminDistributorsService } from "./admin-distributors.service";
import { AdminApiKeyGuard } from "../../common/admin-api-key.guard";

@ApiTags("Admin – Distributors")
@UseGuards(AdminApiKeyGuard)
@ApiSecurity("AdminApiKey")
@Controller("admin/distributors")
export class AdminDistributorsController {
  constructor(private readonly service: AdminDistributorsService) {}

  @Get()
  @ApiOperation({ summary: "Listar distribuidores" })
  findAll() { return this.service.findAll(); }

  @Post(":code/rotate-key")
  @ApiOperation({ summary: "Rotacionar API key do distribuidor" })
  rotateKey(@Param("code") code: string) {
    return this.service.rotateKey(code);
  }
}
