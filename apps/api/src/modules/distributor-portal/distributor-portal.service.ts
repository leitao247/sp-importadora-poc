import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { OrderStatus } from "@prisma/client";

const ALLOWED_NEXT: Record<string, OrderStatus[]> = {
  ASSIGNED: ["ACCEPTED", "CANCELED"],
  ACCEPTED: ["PACKING", "CANCELED"],
  PACKING: ["SHIPPED"],
  SHIPPED: ["DELIVERED"],
};

@Injectable()
export class DistributorPortalService {
  constructor(private readonly prisma: PrismaService) {}

  async listOrders(distributorId: string, status?: string) {
    return this.prisma.order.findMany({
      where: {
        assignedDistributorId: distributorId,
        ...(status ? { status: status as OrderStatus } : {}),
      },
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  async updateStatus(distributorId: string, orderId: string, to: string, note?: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException("Pedido não encontrado");
    if (order.assignedDistributorId !== distributorId) throw new ForbiddenException("Pedido não pertence a este distribuidor");

    const allowed = ALLOWED_NEXT[order.status] ?? [];
    if (!allowed.includes(to as OrderStatus)) {
      throw new BadRequestException(`Transição inválida: ${order.status} → ${to}. Permitidas: ${allowed.join(", ")}`);
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const up = await tx.order.update({
        where: { id: orderId },
        data: { status: to as OrderStatus },
      });
      await tx.orderStatusHistory.create({
        data: { orderId, fromStatus: order.status, toStatus: to as OrderStatus, note },
      });
      await tx.orderEvent.create({
        data: {
          orderId,
          type: "ORDER_STATUS_CHANGED",
          payload: { from: order.status, to, note },
        },
      });
      return up;
    });

    return { orderId, from: order.status, to: updated.status };
  }
}
