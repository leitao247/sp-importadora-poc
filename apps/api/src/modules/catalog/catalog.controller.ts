import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { CatalogService } from "./catalog.service";

@ApiTags("Catalog")
@Controller("catalog")
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get("products")
  @ApiOperation({ summary: "Listar produtos ativos" })
  @ApiQuery({ name: "q", required: false })
  findAll(@Query("q") q?: string) {
    return this.catalog.findAll(q);
  }

  @Get("products/:code")
  @ApiOperation({ summary: "Buscar produto por código" })
  findOne(@Param("code") code: string) {
    return this.catalog.findByCode(code);
  }
}
