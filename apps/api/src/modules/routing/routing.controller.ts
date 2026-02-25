import { Controller, Post, Body, BadRequestException } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { RoutingService } from "./routing.service";

@ApiTags("Routing")
@Controller("routing")
export class RoutingController {
  constructor(private readonly routing: RoutingService) {}

  @Post("quote")
  @ApiOperation({ summary: "Calcular roteamento por CEP" })
  async quote(@Body() body: { cep: string }) {
    if (!body?.cep) throw new BadRequestException("Campo cep é obrigatório");
    return this.routing.quote(body.cep);
  }
}
