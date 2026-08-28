import { BadRequestException } from '@nestjs/common';
import { ProductStatus, PurchaseOrderStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { ProductEntity } from '../../../../products/domain/product.entity';
import type { IProductRepository } from '../../../../products/domain/product.repository';
import { PurchaseOrderEntity } from '../../domain/purchase-order.entity';
import { PurchaseOrderItemEntity } from '../../domain/purchase-order-item.entity';
import type { IPurchaseOrderRepository } from '../../domain/purchase-order.repository';
import { SupplierEntity } from '../../../suppliers/domain/supplier.entity';
import type { ISupplierRepository } from '../../../suppliers/domain/supplier.repository';
import { CreatePurchaseOrderUseCase } from './create-purchase-order.use-case';

const buildPurchaseOrder = () =>
  new PurchaseOrderEntity(
    'purchase-order-1',
    'org-1',
    'supplier-1',
    PurchaseOrderStatus.DRAFT,
    new Decimal(50),
    [
      new PurchaseOrderItemEntity(
        'item-1',
        'purchase-order-1',
        'product-1',
        'Product One',
        'SKU-1',
        'Snapshot description',
        2,
        0,
        new Decimal(25),
        new Decimal(50),
        new Date('2026-01-01T00:00:00.000Z'),
        new Date('2026-01-01T00:00:00.000Z'),
      ),
    ],
    [],
    null,
    null,
    new Date('2026-01-01T00:00:00.000Z'),
    new Date('2026-01-01T00:00:00.000Z'),
  );

describe('CreatePurchaseOrderUseCase', () => {
  const supplierRepository: jest.Mocked<ISupplierRepository> = {
    findById: jest.fn(),
    findAllByOrganization: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const productRepository: jest.Mocked<IProductRepository> = {
    findById: jest.fn(),
    findAllByOrganization: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const purchaseOrderRepository: jest.Mocked<IPurchaseOrderRepository> = {
    findById: jest.fn(),
    findAllByOrganization: jest.fn(),
    create: jest.fn(),
    updateStatus: jest.fn(),
    recordReceipt: jest.fn(),
    delete: jest.fn(),
  };

  const useCase = new CreatePurchaseOrderUseCase(
    purchaseOrderRepository,
    supplierRepository,
    productRepository,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects suppliers from another organization', async () => {
    supplierRepository.findById.mockResolvedValue(
      new SupplierEntity(
        'supplier-1',
        'org-2',
        'Supplier',
        null,
        null,
        null,
        null,
        null,
        new Date('2026-01-01T00:00:00.000Z'),
        new Date('2026-01-01T00:00:00.000Z'),
      ),
    );

    await expect(
      useCase.execute('org-1', {
        supplierId: 'supplier-1',
        items: [{ productId: 'product-1', quantity: 1, unitCost: 12 }],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects products from another organization', async () => {
    supplierRepository.findById.mockResolvedValue(
      new SupplierEntity(
        'supplier-1',
        'org-1',
        'Supplier',
        null,
        null,
        null,
        null,
        null,
        new Date('2026-01-01T00:00:00.000Z'),
        new Date('2026-01-01T00:00:00.000Z'),
      ),
    );
    productRepository.findById.mockResolvedValue(
      new ProductEntity(
        'product-1',
        'org-2',
        'Product One',
        'Description',
        'SKU-1',
        new Decimal(20),
        10,
        ProductStatus.ACTIVE,
        new Date('2026-01-01T00:00:00.000Z'),
        new Date('2026-01-01T00:00:00.000Z'),
      ),
    );

    await expect(
      useCase.execute('org-1', {
        supplierId: 'supplier-1',
        items: [{ productId: 'product-1', quantity: 1, unitCost: 12 }],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('persists product snapshots and ordered costs', async () => {
    supplierRepository.findById.mockResolvedValue(
      new SupplierEntity(
        'supplier-1',
        'org-1',
        'Supplier',
        null,
        null,
        null,
        null,
        null,
        new Date('2026-01-01T00:00:00.000Z'),
        new Date('2026-01-01T00:00:00.000Z'),
      ),
    );
    productRepository.findById.mockResolvedValue(
      new ProductEntity(
        'product-1',
        'org-1',
        'Product One',
        'Snapshot description',
        'SKU-1',
        new Decimal(30),
        10,
        ProductStatus.ACTIVE,
        new Date('2026-01-01T00:00:00.000Z'),
        new Date('2026-01-01T00:00:00.000Z'),
      ),
    );
    purchaseOrderRepository.create.mockResolvedValue(buildPurchaseOrder());

    await useCase.execute('org-1', {
      supplierId: 'supplier-1',
      items: [{ productId: 'product-1', quantity: 2, unitCost: 25 }],
    });

    expect(purchaseOrderRepository.create).toHaveBeenCalledWith({
      organizationId: 'org-1',
      supplierId: 'supplier-1',
      items: [
        {
          productId: 'product-1',
          productName: 'Product One',
          productSku: 'SKU-1',
          productDescription: 'Snapshot description',
          orderedQuantity: 2,
          unitCost: new Decimal(25),
        },
      ],
    });
  });
});
