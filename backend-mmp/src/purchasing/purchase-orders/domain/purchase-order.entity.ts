import { PurchaseOrderStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PurchaseOrderDomainError } from './purchase-order-domain.error';
import { PurchaseOrderItemEntity } from './purchase-order-item.entity';
import { PurchaseReceiptEntity } from './purchase-receipt.entity';

export interface PurchaseOrderReceiptLine {
  purchaseOrderItemId: string;
  quantity: number;
}

export class PurchaseOrderEntity {
  constructor(
    public readonly id: string,
    public readonly organizationId: string,
    public readonly supplierId: string,
    public readonly status: PurchaseOrderStatus,
    public readonly total: Decimal,
    public readonly items: PurchaseOrderItemEntity[],
    public readonly receipts: PurchaseReceiptEntity[],
    public readonly orderedAt: Date | null,
    public readonly receivedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  order(): PurchaseOrderEntity {
    if (this.items.length === 0) {
      throw new PurchaseOrderDomainError(
        'Purchase order must contain at least one item',
      );
    }

    return this.transitionTo(PurchaseOrderStatus.ORDERED, [
      PurchaseOrderStatus.DRAFT,
    ]);
  }

  cancel(): PurchaseOrderEntity {
    return this.transitionTo(PurchaseOrderStatus.CANCELLED, [
      PurchaseOrderStatus.DRAFT,
      PurchaseOrderStatus.ORDERED,
    ]);
  }

  receive(receiptLines: PurchaseOrderReceiptLine[]): PurchaseOrderEntity {
    this.assertCanReceive();

    if (receiptLines.length === 0) {
      throw new PurchaseOrderDomainError(
        'Purchase receipt must contain at least one item',
      );
    }

    const quantitiesByItemId = new Map<string, number>();
    for (const line of receiptLines) {
      if (line.quantity <= 0) {
        throw new PurchaseOrderDomainError(
          'Receipt quantities must be positive',
        );
      }
      if (quantitiesByItemId.has(line.purchaseOrderItemId)) {
        throw new PurchaseOrderDomainError(
          `Purchase order item ${line.purchaseOrderItemId} can only appear once per receipt`,
        );
      }

      quantitiesByItemId.set(line.purchaseOrderItemId, line.quantity);
    }

    const itemsById = new Map(this.items.map((item) => [item.id, item]));
    for (const purchaseOrderItemId of quantitiesByItemId.keys()) {
      if (!itemsById.has(purchaseOrderItemId)) {
        throw new PurchaseOrderDomainError(
          `Purchase order item ${purchaseOrderItemId} not found`,
        );
      }
    }

    const updatedItems = this.items.map((item) => {
      const receivedIncrement = quantitiesByItemId.get(item.id);
      if (!receivedIncrement) {
        return item;
      }

      const nextReceivedQuantity = item.receivedQuantity + receivedIncrement;
      if (nextReceivedQuantity > item.orderedQuantity) {
        throw new PurchaseOrderDomainError(
          `Received quantity for product "${item.productName}" exceeds ordered quantity`,
        );
      }

      return item.withReceivedQuantity(nextReceivedQuantity);
    });

    const nextStatus = updatedItems.every(
      (item) => item.receivedQuantity === item.orderedQuantity,
    )
      ? PurchaseOrderStatus.RECEIVED
      : PurchaseOrderStatus.PARTIALLY_RECEIVED;

    return new PurchaseOrderEntity(
      this.id,
      this.organizationId,
      this.supplierId,
      nextStatus,
      this.total,
      updatedItems,
      this.receipts,
      this.orderedAt,
      nextStatus === PurchaseOrderStatus.RECEIVED
        ? new Date()
        : this.receivedAt,
      this.createdAt,
      this.updatedAt,
    );
  }

  assertCanReceive(): void {
    if (this.status === PurchaseOrderStatus.DRAFT) {
      throw new PurchaseOrderDomainError(
        'Purchase order must be ordered before receiving items',
      );
    }

    if (this.status === PurchaseOrderStatus.CANCELLED) {
      throw new PurchaseOrderDomainError(
        'Cancelled purchase orders cannot receive items',
      );
    }

    if (this.status === PurchaseOrderStatus.RECEIVED) {
      throw new PurchaseOrderDomainError(
        'Received purchase orders cannot receive items',
      );
    }
  }

  assertCanBeDeleted(): void {
    if (
      this.items.some((item) => item.receivedQuantity > 0) ||
      this.receipts.length > 0
    ) {
      throw new PurchaseOrderDomainError(
        'Purchase orders with receipts cannot be deleted',
      );
    }

    if (
      this.status !== PurchaseOrderStatus.DRAFT &&
      this.status !== PurchaseOrderStatus.CANCELLED
    ) {
      throw new PurchaseOrderDomainError(
        `Purchase order with status ${this.status} cannot be deleted`,
      );
    }
  }

  private transitionTo(
    nextStatus: PurchaseOrderStatus,
    allowedCurrentStatuses: PurchaseOrderStatus[],
  ): PurchaseOrderEntity {
    if (!allowedCurrentStatuses.includes(this.status)) {
      throw new PurchaseOrderDomainError(
        `Cannot transition purchase order from ${this.status} to ${nextStatus}`,
      );
    }

    return new PurchaseOrderEntity(
      this.id,
      this.organizationId,
      this.supplierId,
      nextStatus,
      this.total,
      this.items,
      this.receipts,
      this.orderedAt,
      this.receivedAt,
      this.createdAt,
      this.updatedAt,
    );
  }
}
