export class PurchaseReceiptItemEntity {
  constructor(
    public readonly id: string,
    public readonly purchaseReceiptId: string,
    public readonly purchaseOrderItemId: string,
    public readonly productId: string,
    public readonly productName: string,
    public readonly quantity: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
