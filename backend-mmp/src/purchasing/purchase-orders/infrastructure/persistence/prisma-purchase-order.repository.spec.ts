import { PurchaseOrderStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../../../../prisma/prisma.service';
import { PurchaseOrderDomainError } from '../../domain/purchase-order-domain.error';
import { PrismaPurchaseOrderRepository } from './prisma-purchase-order.repository';

const buildPersistedPurchaseOrder = (
  status: PurchaseOrderStatus,
  orderedQuantity: number,
  receivedQuantity: number,
) => ({
  id: 'purchase-order-1',
  organizationId: 'org-1',
  supplierId: 'supplier-1',
  status,
  total: new Decimal(50),
  orderedAt: new Date('2026-01-01T00:00:00.000Z'),
  receivedAt:
    status === PurchaseOrderStatus.RECEIVED
      ? new Date('2026-01-03T00:00:00.000Z')
      : null,
  items: [
    {
      id: 'item-1',
      purchaseOrderId: 'purchase-order-1',
      productId: 'product-1',
      productName: 'Product One',
      productSku: 'SKU-1',
      productDescription: 'Historic description',
      orderedQuantity,
      receivedQuantity,
      unitCost: new Decimal(10),
      total: new Decimal(orderedQuantity).mul(10),
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    },
  ],
  receipts: [],
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-02T00:00:00.000Z'),
});

describe('PrismaPurchaseOrderRepository', () => {
  const tx = {
    product: {
      updateMany: jest.fn(),
    },
    purchaseOrder: {
      findUnique: jest.fn(),
      updateMany: jest.fn(),
    },
    purchaseOrderItem: {
      updateMany: jest.fn(),
    },
    purchaseReceipt: {
      create: jest.fn(),
    },
  };

  const prisma = {
    $transaction: jest.fn(),
    purchaseOrder: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
  } as unknown as PrismaService;

  const repository = new PrismaPurchaseOrderRepository(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.$transaction as jest.Mock).mockImplementation(async (callback) =>
      callback(tx),
    );
  });

  it('records a partial receipt and increments product stock', async () => {
    tx.purchaseOrder.findUnique
      .mockResolvedValueOnce(
        buildPersistedPurchaseOrder(PurchaseOrderStatus.ORDERED, 5, 0),
      )
      .mockResolvedValueOnce({
        ...buildPersistedPurchaseOrder(
          PurchaseOrderStatus.PARTIALLY_RECEIVED,
          5,
          2,
        ),
        receipts: [
          {
            id: 'receipt-1',
            organizationId: 'org-1',
            purchaseOrderId: 'purchase-order-1',
            reference: 'GRN-001',
            notes: null,
            receivedAt: new Date('2026-01-02T00:00:00.000Z'),
            items: [
              {
                id: 'receipt-item-1',
                purchaseReceiptId: 'receipt-1',
                purchaseOrderItemId: 'item-1',
                productId: 'product-1',
                productName: 'Product One',
                quantity: 2,
                createdAt: new Date('2026-01-02T00:00:00.000Z'),
                updatedAt: new Date('2026-01-02T00:00:00.000Z'),
              },
            ],
            createdAt: new Date('2026-01-02T00:00:00.000Z'),
            updatedAt: new Date('2026-01-02T00:00:00.000Z'),
          },
        ],
      });
    tx.purchaseOrderItem.updateMany.mockResolvedValue({ count: 1 });
    tx.product.updateMany.mockResolvedValue({ count: 1 });
    tx.purchaseReceipt.create.mockResolvedValue({ id: 'receipt-1' });
    tx.purchaseOrder.updateMany.mockResolvedValue({ count: 1 });

    const purchaseOrder = await repository.recordReceipt(
      'purchase-order-1',
      'org-1',
      {
        reference: 'GRN-001',
        items: [{ purchaseOrderItemId: 'item-1', quantity: 2 }],
      },
    );

    expect(tx.purchaseOrderItem.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'item-1',
        purchaseOrderId: 'purchase-order-1',
        receivedQuantity: 0,
      },
      data: {
        receivedQuantity: { increment: 2 },
      },
    });
    expect(tx.product.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'product-1',
        organizationId: 'org-1',
      },
      data: {
        stock: { increment: 2 },
      },
    });
    expect(tx.purchaseOrder.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'purchase-order-1',
        organizationId: 'org-1',
        status: PurchaseOrderStatus.ORDERED,
      },
      data: {
        status: PurchaseOrderStatus.PARTIALLY_RECEIVED,
        receivedAt: null,
      },
    });
    expect(purchaseOrder.status).toBe(PurchaseOrderStatus.PARTIALLY_RECEIVED);
    expect(purchaseOrder.items[0].receivedQuantity).toBe(2);
  });

  it('prevents over-receiving order items', async () => {
    tx.purchaseOrder.findUnique.mockResolvedValue(
      buildPersistedPurchaseOrder(PurchaseOrderStatus.PARTIALLY_RECEIVED, 5, 4),
    );

    await expect(
      repository.recordReceipt('purchase-order-1', 'org-1', {
        items: [{ purchaseOrderItemId: 'item-1', quantity: 2 }],
      }),
    ).rejects.toThrow(
      new PurchaseOrderDomainError(
        'Received quantity for product "Product One" exceeds ordered quantity',
      ),
    );

    expect(tx.purchaseOrderItem.updateMany).not.toHaveBeenCalled();
    expect(tx.product.updateMany).not.toHaveBeenCalled();
  });

  it('marks the order as received after the final receipt', async () => {
    tx.purchaseOrder.findUnique
      .mockResolvedValueOnce(
        buildPersistedPurchaseOrder(
          PurchaseOrderStatus.PARTIALLY_RECEIVED,
          5,
          2,
        ),
      )
      .mockResolvedValueOnce(
        buildPersistedPurchaseOrder(PurchaseOrderStatus.RECEIVED, 5, 5),
      );
    tx.purchaseOrderItem.updateMany.mockResolvedValue({ count: 1 });
    tx.product.updateMany.mockResolvedValue({ count: 1 });
    tx.purchaseReceipt.create.mockResolvedValue({ id: 'receipt-2' });
    tx.purchaseOrder.updateMany.mockResolvedValue({ count: 1 });

    const purchaseOrder = await repository.recordReceipt(
      'purchase-order-1',
      'org-1',
      {
        items: [{ purchaseOrderItemId: 'item-1', quantity: 3 }],
      },
    );

    expect(tx.purchaseOrder.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'purchase-order-1',
        organizationId: 'org-1',
        status: PurchaseOrderStatus.PARTIALLY_RECEIVED,
      },
      data: {
        status: PurchaseOrderStatus.RECEIVED,
        receivedAt: expect.any(Date),
      },
    });
    expect(purchaseOrder.status).toBe(PurchaseOrderStatus.RECEIVED);
    expect(purchaseOrder.items[0].receivedQuantity).toBe(5);
  });
});
