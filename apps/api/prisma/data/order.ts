import { PrismaClient } from "@prisma/client";

export async function seedOrder(prisma: PrismaClient): Promise<string> {
  // Buscar produto e distribuidor
  const product = await prisma.product.findUnique({ where: { code: "3000211" } });
  const distributor = await prisma.distributor.findUnique({ where: { code: "DISTR_PR_001" } });

  if (!product || !distributor) {
    console.warn("⚠️  Produto ou distribuidor não encontrado para seed de pedido.");
    return "N/A";
  }

  const quantity = 2;
  const unitPrice = Number(product.priceUnit);
  const lineTotal = unitPrice * quantity;
  const shippingPrice = 25.0;
  const total = lineTotal + shippingPrice;

  const order = await prisma.order.create({
    data: {
      customerName: "João Silva (Teste Seed)",
      customerEmail: "joao@exemplo.com",
      customerCep: "80010000",
      customerLat: -25.4284,
      customerLng: -49.2733,
      status: "ASSIGNED",
      subtotal: lineTotal,
      shippingPrice,
      total,
      assignedDistributorId: distributor.id,
      shippingZoneCode: "ZONA_PR",
      shippingZoneName: "Paraná",
      items: {
        create: [
          {
            productId: product.id,
            productCode: product.code,
            productName: product.name,
            sellType: "UNIT",
            quantity,
            unitPrice,
            lineTotal,
          },
        ],
      },
      statusHistory: {
        createMany: {
          data: [
            { fromStatus: null, toStatus: "CREATED", note: "Pedido criado (seed)" },
            { fromStatus: "CREATED", toStatus: "ASSIGNED", note: "Distribuidor atribuído (seed)" },
          ],
        },
      },
    },
  });

  // Routing decision
  await prisma.routingDecision.create({
    data: {
      orderId: order.id,
      distributorId: distributor.id,
      customerLat: -25.4284,
      customerLng: -49.2733,
      distanceKm: 0.5,
      candidatesJson: [
        { code: "DISTR_PR_001", name: "Distribuidora Curitiba Premium", distanceKm: 0.5 },
      ],
    },
  });

  // Eventos
  await prisma.orderEvent.createMany({
    data: [
      {
        orderId: order.id,
        type: "ORDER_CREATED",
        payload: { customerCep: "80010000" },
      },
      {
        orderId: order.id,
        type: "ORDER_ASSIGNED",
        payload: { distributorCode: "DISTR_PR_001", distanceKm: 0.5 },
      },
    ],
  });

  return order.id;
}
