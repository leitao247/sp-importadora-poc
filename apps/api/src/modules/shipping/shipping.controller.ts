import { Controller, Get, Query, BadRequestException } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { ShippingService } from "./shipping.service";

@ApiTags("Shipping")
@Controller("shipping")
export class ShippingController {
  constructor(private readonly shipping: ShippingService) {}

  @Get("quote")
  @ApiOperation({ summary: "Calcular frete por CEP" })
  @ApiQuery({ name: "cep", required: true, example: "80010-000" })
  async quote(@Query("cep") cep: string) {
    if (!cep) throw new BadRequestException("Parâmetro cep é obrigatório");
    return this.shipping.quoteByCep(cep);
  }
}
