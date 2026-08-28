import { Decimal } from '@prisma/client/runtime/library';

export class OrderItemEntity {
  constructor(
    public readonly id: string,
    public readonly orderId: string,
    public readonly productId: string,
    public readonly productName: string,
    public readonly productSku: string | null,
    public readonly productDescription: string | null,
    public readonly quantity: number,
    public readonly unitPrice: Decimal,
    public readonly total: Decimal,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
