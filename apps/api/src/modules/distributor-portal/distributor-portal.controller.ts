import { Controller, Get, Patch, Param, Body, UseGuards, Req, Query } from "@nestjs/common";
import { ApiOperation, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { DistributorPortalService } from "./distributor-portal.service";
import { DistributorApiKeyGuard } from "../../common/distributor-api-key.guard";

@ApiTags("Distributor Portal")
@UseGuards(DistributorApiKeyGuard)
@ApiSecurity("DistributorApiKey")
@Controller("distributor")
export class DistributorPortalController {
  constructor(private readonly portal: DistributorPortalService) {}

  @Get("orders")
  @ApiOperation({ summary: "Listar pedidos do distribuidor" })
  listOrders(@Req() req: any, @Query("status") status?: string) {
    return this.portal.listOrders(req.distributor.id, status);
  }

  @Patch("orders/:id/status")
  @ApiOperation({ summary: "Atualizar status do pedido" })
  updateStatus(@Req() req: any, @Param("id") id: string, @Body() body: { to: string; note?: string }) {
    return this.portal.updateStatus(req.distributor.id, id, body.to, body.note);
  }
}
