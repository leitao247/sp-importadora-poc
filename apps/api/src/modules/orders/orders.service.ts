import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NominatimService } from "../nominatim/nominatim.service";
import { ShippingService } from "../shipping/shipping.service";
import { haversineKm } from "../../common/distance.util";
import { normalizeCep, isValidCep } from "../../common/cep.util";
import { env } from "../../env";

interface OrderItemInput {
  productCode: string;
  quantity: number;
  sellType?: "UNIT" | "BOX";
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly nominatim: NominatimService,
    private readonly shipping: ShippingService,
  ) {}

  async createGuestOrder(body: {
    customerName: string;
    customerEmail?: string;
    customerCep: string;
    items: OrderItemInput[];
  }) {
    const cep = normalizeCep(body.customerCep);
    if (!isValidCep(cep)) throw new BadRequestException(`CEP inválido: ${body.customerCep}`);

    // 1. Geocodificar CEP
    const geo = await this.nominatim.geocodeCep(cep);

    // 2. Buscar produtos e calcular subtotal
    let subtotal = 0;
    const itemsData = [];

    for (const item of body.items) {
      const product = await this.prisma.product.findUnique({ where: { code: item.productCode } });
      if (!product || !product.active) {
        throw new BadRequestException(`Produto não encontrado: ${item.productCode}`);
      }

      const sellType = item.sellType || "UNIT";
      const unitPrice = sellType === "BOX" ? Number(product.priceBox) : Number(product.priceUnit);
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;

      itemsData.push({
        productId: product.id,
        productCode: product.code,
        productName: sellType === "BOX"
          ? `${product.name} (Caixa c/ ${product.unitsPerBox} un.)`
          : `${product.name} (Unidade)`,
        sellType,
        quantity: item.quantity,
        unitPrice,
        lineTotal,
      });
    }

    // 3. Calcular frete
    let shippingPrice = 0;
    let shippingZoneCode: string | null = null;
    let shippingZoneName: string | null = null;

    try {
      const shippingResult = await this.shipping.quoteByCep(cep);
      shippingPrice = shippingResult.price;
      shippingZoneCode = shippingResult.zoneCode;
      shippingZoneName = shippingResult.zoneName;
    } catch {
      // frete 0 se não encontrado
    }

    const total = subtotal + shippingPrice;

    // 4. Rotear distribuidor
    let assignedDistributor = null;
    let distanceKm = 0;
    let candidatesJson: any[] = [];

    if (geo) {
      const maxKm = env.ROUTING_DEFAULT_MAX_KM;
      const distributors = await this.prisma.distributor.findMany({
        where: { active: true, lat: { not: null }, lng: { not: null } },
      });

      const candidates = distributors
        .map((d) => ({
          ...d,
          distanceKm: haversineKm(geo.lat, geo.lng, d.lat!, d.lng!),
        }))
        .filter((d) => d.distanceKm <= (d.serviceRadiusKm ?? maxKm))
        .sort((a, b) => a.distanceKm - b.distanceKm || b.priority - a.priority);

      candidatesJson = candidates.slice(0, 10).map((c) => ({
        code: c.code,
        name: c.name,
        distanceKm: c.distanceKm,
      }));

      assignedDistributor = candidates[0] || null;
      distanceKm = assignedDistributor?.distanceKm ?? 0;
    }

    // 5. Persistir
    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          customerName: body.customerName,
          customerEmail: body.customerEmail,
          customerCep: cep,
          customerLat: geo?.lat,
          customerLng: geo?.lng,
          status: assignedDistributor ? "ASSIGNED" : "CREATED",
          subtotal,
          shippingPrice,
          total,
          assignedDistributorId: assignedDistributor?.id,
          shippingZoneCode,
          shippingZoneName,
          items: { createMany: { data: itemsData } },
          statusHistory: {
            createMany: {
              data: [
                { fromStatus: null, toStatus: "CREATED" },
                ...(assignedDistributor
                  ? [{ fromStatus: "CREATED" as any, toStatus: "ASSIGNED" as any, note: `Dist: ${assignedDistributor.code}` }]
                  : []),
              ],
            },
          },
        },
      });

      // Routing decision
      if (assignedDistributor && geo) {
        await tx.routingDecision.create({
          data: {
            orderId: newOrder.id,
            distributorId: assignedDistributor.id,
            customerLat: geo.lat,
            customerLng: geo.lng,
            distanceKm,
            candidatesJson,
          },
        });
      }

      // Eventos
      await tx.orderEvent.createMany({
        data: [
          { orderId: newOrder.id, type: "ORDER_CREATED", payload: { cep } },
          ...(assignedDistributor
            ? [{
                orderId: newOrder.id,
                type: "ORDER_ASSIGNED" as any,
                payload: { distributorCode: assignedDistributor.code, distanceKm },
              }]
            : []),
        ],
      });

      return newOrder;
    });

    return {
      orderId: order.id,
      status: order.status,
      subtotal,
      shippingPrice,
      total,
      shippingZone: shippingZoneName,
      assignedDistributor: assignedDistributor
        ? { code: assignedDistributor.code, name: assignedDistributor.name, distanceKm }
        : null,
    };
  }

  async getPublicTracking(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        statusHistory: { orderBy: { createdAt: "asc" } },
        items: true,
      },
    });

    if (!order) throw new NotFoundException("Pedido não encontrado");

    return {
      orderId: order.id,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      shippingZone: order.shippingZoneName,
      totals: {
        subtotal: Number(order.subtotal),
        shipping: Number(order.shippingPrice),
        total: Number(order.total),
      },
      items: order.items.map((i) => ({
        productCode: i.productCode,
        productName: i.productName,
        quantity: i.quantity,
        sellType: i.sellType,
        lineTotal: Number(i.lineTotal),
      })),
      history: order.statusHistory.map((h) => ({
        from: h.fromStatus,
        to: h.toStatus,
        note: h.note,
        at: h.createdAt,
      })),
    };
  }
}
