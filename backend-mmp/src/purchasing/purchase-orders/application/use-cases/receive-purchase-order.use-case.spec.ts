import { BadRequestException } from '@nestjs/common';
import { PurchaseOrderStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PurchaseOrderEntity } from '../../domain/purchase-order.entity';
import { PurchaseOrderItemEntity } from '../../domain/purchase-order-item.entity';
import type { IPurchaseOrderRepository } from '../../domain/purchase-order.repository';
import { ReceivePurchaseOrderUseCase } from './receive-purchase-order.use-case';

const buildOrder = (status: PurchaseOrderStatus, receivedQuantity = 0) =>
  new PurchaseOrderEntity(
    'purchase-order-1',
    'org-1',
    'supplier-1',
    status,
    new Decimal(50),
    [
      new PurchaseOrderItemEntity(
        'item-1',
        'purchase-order-1',
        'product-1',
        'Product One',
        'SKU-1',
        'Historic description',
        5,
        receivedQuantity,
        new Decimal(10),
        new Decimal(50),
        new Date('2026-01-01T00:00:00.000Z'),
        new Date('2026-01-01T00:00:00.000Z'),
      ),
    ],
    [],
    new Date('2026-01-01T00:00:00.000Z'),
    null,
    new Date('2026-01-01T00:00:00.000Z'),
    new Date('2026-01-01T00:00:00.000Z'),
  );

describe('ReceivePurchaseOrderUseCase', () => {
  const purchaseOrderRepository: jest.Mocked<IPurchaseOrderRepository> = {
    findById: jest.fn(),
    findAllByOrganization: jest.fn(),
    create: jest.fn(),
    updateStatus: jest.fn(),
    recordReceipt: jest.fn(),
    delete: jest.fn(),
  };

  const useCase = new ReceivePurchaseOrderUseCase(purchaseOrderRepository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([PurchaseOrderStatus.CANCELLED, PurchaseOrderStatus.RECEIVED])(
    'rejects receipts for %s purchase orders',
    async (status) => {
      purchaseOrderRepository.findById.mockResolvedValue(
        status === PurchaseOrderStatus.RECEIVED
          ? buildOrder(status, 5)
          : buildOrder(status),
      );

      await expect(
        useCase.execute('org-1', 'purchase-order-1', {
          items: [{ purchaseOrderItemId: 'item-1', quantity: 1 }],
        }),
      ).rejects.toThrow(BadRequestException);

      expect(purchaseOrderRepository.recordReceipt).not.toHaveBeenCalled();
    },
  );

  it('records valid receipts through the repository', async () => {
    purchaseOrderRepository.findById.mockResolvedValue(
      buildOrder(PurchaseOrderStatus.ORDERED),
    );
    purchaseOrderRepository.recordReceipt.mockResolvedValue(
      buildOrder(PurchaseOrderStatus.PARTIALLY_RECEIVED, 2),
    );

    const purchaseOrder = await useCase.execute('org-1', 'purchase-order-1', {
      reference: 'GRN-001',
      items: [{ purchaseOrderItemId: 'item-1', quantity: 2 }],
    });

    expect(purchaseOrderRepository.recordReceipt).toHaveBeenCalledWith(
      'purchase-order-1',
      'org-1',
      {
        reference: 'GRN-001',
        items: [{ purchaseOrderItemId: 'item-1', quantity: 2 }],
      },
    );
    expect(purchaseOrder.status).toBe(PurchaseOrderStatus.PARTIALLY_RECEIVED);
  });
});
