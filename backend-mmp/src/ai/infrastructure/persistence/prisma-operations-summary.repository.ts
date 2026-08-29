import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import type {
  OperationsSummaryRepository,
  OperationsSummarySnapshot,
} from '../../application/operations-summary.repository';

@Injectable()
export class PrismaOperationsSummaryRepository
  implements OperationsSummaryRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async getSnapshot(
    organizationId: string,
  ): Promise<OperationsSummarySnapshot> {
    const [totalProducts, activeProducts, outOfStock, salesOrders, purchaseOrders] =
      await Promise.all([
        this.prisma.product.count({ where: { organizationId } }),
        this.prisma.product.count({ where: { organizationId, status: 'ACTIVE' } }),
        this.prisma.product.count({ where: { organizationId, stock: { lte: 0 } } }),
        this.prisma.order.groupBy({
          by: ['status'],
          where: { organizationId },
          _count: { _all: true },
        }),
        this.prisma.purchaseOrder.groupBy({
          by: ['status'],
          where: { organizationId },
          _count: { _all: true },
        }),
      ]);

    return {
      products: { total: totalProducts, active: activeProducts, outOfStock },
      salesOrders: Object.fromEntries(
        salesOrders.map((order) => [order.status, order._count._all]),
      ),
      purchaseOrders: Object.fromEntries(
        purchaseOrders.map((order) => [order.status, order._count._all]),
      ),
    };
  }
}
