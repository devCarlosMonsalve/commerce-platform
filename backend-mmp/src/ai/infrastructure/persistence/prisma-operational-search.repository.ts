import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import type {
  OperationalSearchItem,
  OperationalSearchRepository,
} from '../../application/operational-search.repository';

const MAX_RESULTS = 5;

@Injectable()
export class PrismaOperationalSearchRepository
  implements OperationalSearchRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async findOutOfStockProducts(
    organizationId: string,
  ): Promise<OperationalSearchItem[]> {
    const products = await this.prisma.product.findMany({
      where: { organizationId, stock: { lte: 0 } },
      select: { id: true, name: true, sku: true, stock: true },
      orderBy: [{ stock: 'asc' }, { updatedAt: 'desc' }],
      take: MAX_RESULTS,
    });

    return products.map((product) => ({
      id: product.id,
      label: product.name,
      detail: product.sku
        ? `SKU ${product.sku} · Stock ${product.stock}`
        : `Stock ${product.stock}`,
    }));
  }

  async findPendingSalesOrders(
    organizationId: string,
  ): Promise<OperationalSearchItem[]> {
    const orders = await this.prisma.order.findMany({
      where: { organizationId, status: 'PENDING' },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: 'asc' },
      take: MAX_RESULTS,
    });

    return orders.map((order) => ({
      id: order.id,
      label: `Order ${order.id}`,
      detail: `Pending · Updated ${order.updatedAt.toISOString()}`,
    }));
  }

  async findOpenPurchaseOrders(
    organizationId: string,
  ): Promise<OperationalSearchItem[]> {
    const orders = await this.prisma.purchaseOrder.findMany({
      where: {
        organizationId,
        status: { in: ['ORDERED', 'PARTIALLY_RECEIVED'] },
      },
      select: { id: true, status: true, orderedAt: true },
      orderBy: { orderedAt: 'asc' },
      take: MAX_RESULTS,
    });

    return orders.map((order) => ({
      id: order.id,
      label: `Purchase order ${order.id}`,
      detail: order.orderedAt
        ? `${order.status} · Ordered ${order.orderedAt.toISOString()}`
        : order.status,
    }));
  }
}
