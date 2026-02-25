import { Module } from "@nestjs/common";
import { AdminDistributorsController } from "./admin-distributors.controller";
import { AdminDistributorsService } from "./admin-distributors.service";

@Module({
  controllers: [AdminDistributorsController],
  providers: [AdminDistributorsService],
})
export class AdminDistributorsModule {}
