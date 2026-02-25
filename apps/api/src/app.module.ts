import { Module } from "@nestjs/common";
import { PrismaModule } from "./modules/prisma/prisma.module";
import { HealthModule } from "./modules/health/health.module";
import { CatalogModule } from "./modules/catalog/catalog.module";
import { ShippingModule } from "./modules/shipping/shipping.module";
import { RoutingModule } from "./modules/routing/routing.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { ImportsModule } from "./modules/imports/imports.module";
import { DistributorPortalModule } from "./modules/distributor-portal/distributor-portal.module";
import { AdminDistributorsModule } from "./modules/admin-distributors/admin-distributors.module";
import { AdminEventsModule } from "./modules/admin-events/admin-events.module";
import { NominatimModule } from "./modules/nominatim/nominatim.module";

@Module({
  imports: [
    PrismaModule,
    NominatimModule,
    HealthModule,
    CatalogModule,
    ShippingModule,
    RoutingModule,
    OrdersModule,
    ImportsModule,
    DistributorPortalModule,
    AdminDistributorsModule,
    AdminEventsModule,
  ],
})
export class AppModule {}
