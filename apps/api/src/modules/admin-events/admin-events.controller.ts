import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { AdminApiKeyGuard } from "../../common/admin-api-key.guard";
import { PrismaService } from "../prisma/prisma.service";

@ApiTags("Admin – Events")
@UseGuards(AdminApiKeyGuard)
@ApiSecurity("AdminApiKey")
@Controller("admin/orders")
export class AdminEventsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get(":id/events")
  @ApiOperation({ summary: "Eventos do pedido (auditoria)" })
  getEvents(@Param("id") id: string) {
    return this.prisma.orderEvent.findMany({
      where: { orderId: id },
      orderBy: { createdAt: "asc" },
    });
  }
}
