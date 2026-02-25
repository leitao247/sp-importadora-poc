import { Module, Global } from "@nestjs/common";
import { NominatimService } from "./nominatim.service";

@Global()
@Module({
  providers: [NominatimService],
  exports: [NominatimService],
})
export class NominatimModule {}
