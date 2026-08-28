import { PurchaseReceiptItemEntity } from './purchase-receipt-item.entity';

export class PurchaseReceiptEntity {
  constructor(
    public readonly id: string,
    public readonly organizationId: string,
    public readonly purchaseOrderId: string,
    public readonly reference: string | null,
    public readonly notes: string | null,
    public readonly receivedAt: Date,
    public readonly items: PurchaseReceiptItemEntity[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
