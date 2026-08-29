import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import type {
  PurchaseSuggestion,
  PurchaseSuggestionsRepository,
} from '../../application/purchase-suggestions.repository';

const STOCK_REVIEW_THRESHOLD = 5;
const MAX_SUGGESTIONS = 10;

@Injectable()
export class PrismaPurchaseSuggestionsRepository
  implements PurchaseSuggestionsRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async findSuggestions(organizationId: string): Promise<PurchaseSuggestion[]> {
    const products = await this.prisma.product.findMany({
      where: {
        organizationId,
        status: 'ACTIVE',
        stock: { lte: STOCK_REVIEW_THRESHOLD },
      },
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        purchaseOrderItems: {
          where: {
            purchaseOrder: {
              organizationId,
              status: { in: ['ORDERED', 'PARTIALLY_RECEIVED'] },
            },
          },
          select: { id: true },
        },
      },
      orderBy: [{ stock: 'asc' }, { updatedAt: 'asc' }],
      take: MAX_SUGGESTIONS,
    });

    return products.map((product) => ({
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      stock: product.stock,
      openPurchaseOrders: product.purchaseOrderItems.length,
    }));
  }
}
