import { PurchaseOrderStatus } from '@prisma/client';
import { PurchaseOrderEntity } from '../../domain/purchase-order.entity';

export class PurchaseOrderItemResponse {
  id: string;
  productId: string;
  productName: string;
  productSku: string | null;
  productDescription: string | null;
  orderedQuantity: number;
  receivedQuantity: number;
  unitCost: string;
  total: string;
}

export class PurchaseReceiptItemResponse {
  id: string;
  purchaseOrderItemId: string;
  productId: string;
  productName: string;
  quantity: number;
}

export class PurchaseReceiptResponse {
  id: string;
  organizationId: string;
  purchaseOrderId: string;
  reference: string | null;
  notes: string | null;
  receivedAt: Date;
  items: PurchaseReceiptItemResponse[];
  createdAt: Date;
  updatedAt: Date;
}

export class PurchaseOrderResponse {
  id: string;
  organizationId: string;
  supplierId: string;
  status: PurchaseOrderStatus;
  total: string;
  orderedAt: Date | null;
  receivedAt: Date | null;
  items: PurchaseOrderItemResponse[];
  receipts: PurchaseReceiptResponse[];
  createdAt: Date;
  updatedAt: Date;

  static from(entity: PurchaseOrderEntity): PurchaseOrderResponse {
    const dto = new PurchaseOrderResponse();
    dto.id = entity.id;
    dto.organizationId = entity.organizationId;
    dto.supplierId = entity.supplierId;
    dto.status = entity.status;
    dto.total = entity.total.toString();
    dto.orderedAt = entity.orderedAt;
    dto.receivedAt = entity.receivedAt;
    dto.items = entity.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      productSku: item.productSku,
      productDescription: item.productDescription,
      orderedQuantity: item.orderedQuantity,
      receivedQuantity: item.receivedQuantity,
      unitCost: item.unitCost.toString(),
      total: item.total.toString(),
    }));
    dto.receipts = entity.receipts.map((receipt) => ({
      id: receipt.id,
      organizationId: receipt.organizationId,
      purchaseOrderId: receipt.purchaseOrderId,
      reference: receipt.reference,
      notes: receipt.notes,
      receivedAt: receipt.receivedAt,
      items: receipt.items.map((item) => ({
        id: item.id,
        purchaseOrderItemId: item.purchaseOrderItemId,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
      })),
      createdAt: receipt.createdAt,
      updatedAt: receipt.updatedAt,
    }));
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
