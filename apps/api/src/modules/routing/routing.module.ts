import { Module } from "@nestjs/common";
import { RoutingController } from "./routing.controller";
import { RoutingService } from "./routing.service";
import { ShippingModule } from "../shipping/shipping.module";

@Module({
  imports: [ShippingModule],
  controllers: [RoutingController],
  providers: [RoutingService],
  exports: [RoutingService],
})
export class RoutingModule {}
