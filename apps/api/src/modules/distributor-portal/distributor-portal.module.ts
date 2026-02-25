import { Module } from "@nestjs/common";
import { DistributorPortalController } from "./distributor-portal.controller";
import { DistributorPortalService } from "./distributor-portal.service";

@Module({
  controllers: [DistributorPortalController],
  providers: [DistributorPortalService],
})
export class DistributorPortalModule {}
