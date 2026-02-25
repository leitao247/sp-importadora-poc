import { Controller, Post, Get, Param, Body } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { OrdersService } from "./orders.service";

@ApiTags("Orders")
@Controller("orders")
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  @ApiOperation({ summary: "Criar pedido (checkout convidado)" })
  create(@Body() body: any) {
    return this.orders.createGuestOrder(body);
  }

  @Get(":id/public")
  @ApiOperation({ summary: "Tracking público do pedido" })
  publicTracking(@Param("id") id: string) {
    return this.orders.getPublicTracking(id);
  }
}
