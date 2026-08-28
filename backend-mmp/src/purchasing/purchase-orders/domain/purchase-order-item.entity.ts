import { Decimal } from '@prisma/client/runtime/library';

export class PurchaseOrderItemEntity {
  constructor(
    public readonly id: string,
    public readonly purchaseOrderId: string,
    public readonly productId: string,
    public readonly productName: string,
    public readonly productSku: string | null,
    public readonly productDescription: string | null,
    public readonly orderedQuantity: number,
    public readonly receivedQuantity: number,
    public readonly unitCost: Decimal,
    public readonly total: Decimal,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  get remainingQuantity(): number {
    return this.orderedQuantity - this.receivedQuantity;
  }

  withReceivedQuantity(receivedQuantity: number): PurchaseOrderItemEntity {
    return new PurchaseOrderItemEntity(
      this.id,
      this.purchaseOrderId,
      this.productId,
      this.productName,
      this.productSku,
      this.productDescription,
      this.orderedQuantity,
      receivedQuantity,
      this.unitCost,
      this.total,
      this.createdAt,
      this.updatedAt,
    );
  }
}
