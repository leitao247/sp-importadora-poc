import {
  Controller, Post, UseInterceptors, UploadedFile,
  UseGuards, BadRequestException
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiConsumes, ApiOperation, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { ImportsService } from "./imports.service";
import { AdminApiKeyGuard } from "../../common/admin-api-key.guard";

@ApiTags("Admin – Imports")
@UseGuards(AdminApiKeyGuard)
@ApiSecurity("AdminApiKey")
@Controller("admin/import")
export class ImportsController {
  constructor(private readonly imports: ImportsService) {}

  @Post("products")
  @ApiOperation({ summary: "Importar produtos via Excel" })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("file"))
  async importProducts(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException("Arquivo não enviado");
    return this.imports.importProductsXlsx(file.buffer);
  }

  @Post("distributors")
  @ApiOperation({ summary: "Importar distribuidores via Excel" })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("file"))
  async importDistributors(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException("Arquivo não enviado");
    return this.imports.importDistributorsXlsx(file.buffer);
  }

  @Post("shipping-zones")
  @ApiOperation({ summary: "Importar zonas de frete via Excel (template único)" })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("file"))
  async importShippingZones(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException("Arquivo não enviado");
    return this.imports.importShippingZonesXlsx(file.buffer);
  }
}
