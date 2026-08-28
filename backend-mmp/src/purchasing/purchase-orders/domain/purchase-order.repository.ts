import { PurchaseOrderStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PurchaseOrderEntity } from './purchase-order.entity';

export const PURCHASE_ORDER_REPOSITORY = 'PURCHASE_ORDER_REPOSITORY';

export interface PurchaseOrderReceiptInput {
  reference?: string;
  notes?: string;
  items: {
    purchaseOrderItemId: string;
    quantity: number;
  }[];
}

export interface IPurchaseOrderRepository {
  findById(id: string): Promise<PurchaseOrderEntity | null>;
  findAllByOrganization(organizationId: string): Promise<PurchaseOrderEntity[]>;
  create(data: {
    organizationId: string;
    supplierId: string;
    items: {
      productId: string;
      productName: string;
      productSku?: string | null;
      productDescription?: string | null;
      orderedQuantity: number;
      unitCost: Decimal;
    }[];
  }): Promise<PurchaseOrderEntity>;
  updateStatus(
    purchaseOrder: PurchaseOrderEntity,
    previousStatus: PurchaseOrderStatus,
  ): Promise<PurchaseOrderEntity>;
  recordReceipt(
    purchaseOrderId: string,
    organizationId: string,
    input: PurchaseOrderReceiptInput,
  ): Promise<PurchaseOrderEntity>;
  delete(id: string): Promise<void>;
}
