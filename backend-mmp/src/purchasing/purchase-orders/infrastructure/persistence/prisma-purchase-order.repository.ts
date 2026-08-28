import { Injectable } from '@nestjs/common';
import { Prisma, PurchaseOrderStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../../../../prisma/prisma.service';
import { PurchaseOrderDomainError } from '../../domain/purchase-order-domain.error';
import { PurchaseOrderEntity } from '../../domain/purchase-order.entity';
import { PurchaseOrderItemEntity } from '../../domain/purchase-order-item.entity';
import {
  IPurchaseOrderRepository,
  PurchaseOrderReceiptInput,
} from '../../domain/purchase-order.repository';
import { PurchaseReceiptEntity } from '../../domain/purchase-receipt.entity';
import { PurchaseReceiptItemEntity } from '../../domain/purchase-receipt-item.entity';

@Injectable()
export class PrismaPurchaseOrderRepository implements IPurchaseOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<PurchaseOrderEntity | null> {
    const purchaseOrder = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: this.purchaseOrderInclude(),
    });

    return purchaseOrder ? this.toEntity(purchaseOrder) : null;
  }

  async findAllByOrganization(
    organizationId: string,
  ): Promise<PurchaseOrderEntity[]> {
    const purchaseOrders = await this.prisma.purchaseOrder.findMany({
      where: { organizationId },
      include: this.purchaseOrderInclude(),
      orderBy: { createdAt: 'desc' },
    });

    return purchaseOrders.map((purchaseOrder) => this.toEntity(purchaseOrder));
  }

  async create(data: {
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
  }): Promise<PurchaseOrderEntity> {
    const total = data.items.reduce(
      (sum, item) => sum.plus(item.unitCost.mul(item.orderedQuantity)),
      new Decimal(0),
    );

    const purchaseOrder = await this.prisma.purchaseOrder.create({
      data: {
        organizationId: data.organizationId,
        supplierId: data.supplierId,
        total,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            productSku: item.productSku,
            productDescription: item.productDescription,
            orderedQuantity: item.orderedQuantity,
            unitCost: item.unitCost,
            total: item.unitCost.mul(item.orderedQuantity),
          })),
        },
      },
      include: this.purchaseOrderInclude(),
    });

    return this.toEntity(purchaseOrder);
  }

  async updateStatus(
    purchaseOrder: PurchaseOrderEntity,
    previousStatus: PurchaseOrderStatus,
  ): Promise<PurchaseOrderEntity> {
    const orderedAt =
      previousStatus === PurchaseOrderStatus.DRAFT &&
      purchaseOrder.status === PurchaseOrderStatus.ORDERED
        ? new Date()
        : undefined;

    const updateResult = await this.prisma.purchaseOrder.updateMany({
      where: {
        id: purchaseOrder.id,
        organizationId: purchaseOrder.organizationId,
        status: previousStatus,
      },
      data: {
        status: purchaseOrder.status,
        orderedAt,
      },
    });

    if (updateResult.count !== 1) {
      throw new PurchaseOrderDomainError(
        'Purchase order status changed before it could be updated',
      );
    }

    const persistedPurchaseOrder = await this.prisma.purchaseOrder.findUnique({
      where: { id: purchaseOrder.id },
      include: this.purchaseOrderInclude(),
    });

    if (!persistedPurchaseOrder) {
      throw new PurchaseOrderDomainError(
        'Purchase order not found after status update',
      );
    }

    return this.toEntity(persistedPurchaseOrder);
  }

  async recordReceipt(
    purchaseOrderId: string,
    organizationId: string,
    input: PurchaseOrderReceiptInput,
  ): Promise<PurchaseOrderEntity> {
    const persistedPurchaseOrder = await this.prisma.$transaction(
      async (tx) => {
        const purchaseOrder = await tx.purchaseOrder.findUnique({
          where: { id: purchaseOrderId },
          include: this.purchaseOrderInclude(),
        });

        if (!purchaseOrder || purchaseOrder.organizationId !== organizationId) {
          throw new PurchaseOrderDomainError('Purchase order not found');
        }

        const currentPurchaseOrder = this.toEntity(purchaseOrder);
        const updatedPurchaseOrder = currentPurchaseOrder.receive(input.items);
        const quantitiesByItemId = new Map(
          input.items.map((item) => [item.purchaseOrderItemId, item.quantity]),
        );
        const receiptTimestamp = new Date();

        for (const item of currentPurchaseOrder.items) {
          const receivedIncrement = quantitiesByItemId.get(item.id);
          if (!receivedIncrement) {
            continue;
          }

          const orderItemResult = await tx.purchaseOrderItem.updateMany({
            where: {
              id: item.id,
              purchaseOrderId,
              receivedQuantity: item.receivedQuantity,
            },
            data: {
              receivedQuantity: { increment: receivedIncrement },
            },
          });

          if (orderItemResult.count !== 1) {
            throw new PurchaseOrderDomainError(
              'Purchase order items changed before receipt could be recorded',
            );
          }

          const productResult = await tx.product.updateMany({
            where: {
              id: item.productId,
              organizationId,
            },
            data: {
              stock: { increment: receivedIncrement },
            },
          });

          if (productResult.count !== 1) {
            throw new PurchaseOrderDomainError(
              `Product ${item.productId} does not belong to this organization`,
            );
          }
        }

        await tx.purchaseReceipt.create({
          data: {
            organizationId,
            purchaseOrderId,
            reference: input.reference,
            notes: input.notes,
            receivedAt: receiptTimestamp,
            items: {
              create: currentPurchaseOrder.items
                .filter((item) => quantitiesByItemId.has(item.id))
                .map((item) => ({
                  purchaseOrderItemId: item.id,
                  productId: item.productId,
                  productName: item.productName,
                  quantity: quantitiesByItemId.get(item.id)!,
                })),
            },
          },
        });

        const updateResult = await tx.purchaseOrder.updateMany({
          where: {
            id: purchaseOrderId,
            organizationId,
            status: currentPurchaseOrder.status,
          },
          data: {
            status: updatedPurchaseOrder.status,
            receivedAt:
              updatedPurchaseOrder.status === PurchaseOrderStatus.RECEIVED
                ? receiptTimestamp
                : null,
          },
        });

        if (updateResult.count !== 1) {
          throw new PurchaseOrderDomainError(
            'Purchase order status changed before receipt could be finalized',
          );
        }

        const completedPurchaseOrder = await tx.purchaseOrder.findUnique({
          where: { id: purchaseOrderId },
          include: this.purchaseOrderInclude(),
        });

        if (!completedPurchaseOrder) {
          throw new PurchaseOrderDomainError(
            'Purchase order not found after receipt',
          );
        }

        return completedPurchaseOrder;
      },
    );

    return this.toEntity(persistedPurchaseOrder);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.purchaseOrder.delete({ where: { id } });
  }

  private purchaseOrderInclude(): Prisma.PurchaseOrderInclude {
    return {
      items: true,
      receipts: {
        include: { items: true },
        orderBy: { createdAt: 'asc' },
      },
    };
  }

  private toEntity(purchaseOrder: any): PurchaseOrderEntity {
    return new PurchaseOrderEntity(
      purchaseOrder.id,
      purchaseOrder.organizationId,
      purchaseOrder.supplierId,
      purchaseOrder.status,
      purchaseOrder.total,
      purchaseOrder.items.map((item) => this.toItemEntity(item)),
      purchaseOrder.receipts.map((receipt) => this.toReceiptEntity(receipt)),
      purchaseOrder.orderedAt,
      purchaseOrder.receivedAt,
      purchaseOrder.createdAt,
      purchaseOrder.updatedAt,
    );
  }

  private toItemEntity(item: any): PurchaseOrderItemEntity {
    return new PurchaseOrderItemEntity(
      item.id,
      item.purchaseOrderId,
      item.productId,
      item.productName,
      item.productSku,
      item.productDescription,
      item.orderedQuantity,
      item.receivedQuantity,
      item.unitCost,
      item.total,
      item.createdAt,
      item.updatedAt,
    );
  }

  private toReceiptEntity(receipt: any): PurchaseReceiptEntity {
    return new PurchaseReceiptEntity(
      receipt.id,
      receipt.organizationId,
      receipt.purchaseOrderId,
      receipt.reference,
      receipt.notes,
      receipt.receivedAt,
      receipt.items.map((item) => this.toReceiptItemEntity(item)),
      receipt.createdAt,
      receipt.updatedAt,
    );
  }

  private toReceiptItemEntity(item: any): PurchaseReceiptItemEntity {
    return new PurchaseReceiptItemEntity(
      item.id,
      item.purchaseReceiptId,
      item.purchaseOrderItemId,
      item.productId,
      item.productName,
      item.quantity,
      item.createdAt,
      item.updatedAt,
    );
  }
}
