import { Module } from "@nestjs/common";
import { AdminEventsController } from "./admin-events.controller";

@Module({ controllers: [AdminEventsController] })
export class AdminEventsModule {}
