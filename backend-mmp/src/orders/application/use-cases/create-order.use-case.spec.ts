import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrderStatus, ProductStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import type { ICustomerRepository } from '../../../customers/domain/customer.repository';
import { CustomerEntity } from '../../../customers/domain/customer.entity';
import type { IProductRepository } from '../../../products/domain/product.repository';
import { ProductEntity } from '../../../products/domain/product.entity';
import { OrderItemEntity } from '../../domain/order-item.entity';
import type { IOrderRepository } from '../../domain/order.repository';
import { OrderEntity } from '../../domain/order.entity';
import { CreateOrderUseCase } from './create-order.use-case';

describe('CreateOrderUseCase', () => {
  const buildOrder = () =>
    new OrderEntity(
      'order-1',
      'org-1',
      'customer-1',
      OrderStatus.DRAFT,
      new Decimal(50),
      [
        new OrderItemEntity(
          'item-1',
          'order-1',
          'product-1',
          'Product One',
          'SKU-1',
          'Snapshot description',
          2,
          new Decimal(25),
          new Decimal(50),
          new Date('2026-01-01T00:00:00.000Z'),
          new Date('2026-01-01T00:00:00.000Z'),
        ),
      ],
      new Date('2026-01-01T00:00:00.000Z'),
      new Date('2026-01-01T00:00:00.000Z'),
    );

  const customerRepository: jest.Mocked<ICustomerRepository> = {
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
  const orderRepository: jest.Mocked<IOrderRepository> = {
    findById: jest.fn(),
    findAllByOrganization: jest.fn(),
    create: jest.fn(),
    updateStatus: jest.fn(),
    delete: jest.fn(),
  };

  const useCase = new CreateOrderUseCase(orderRepository, customerRepository, productRepository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects customers from another organization', async () => {
    customerRepository.findById.mockResolvedValue(
      new CustomerEntity(
        'customer-1',
        'org-2',
        'Customer',
        null,
        null,
        new Date('2026-01-01T00:00:00.000Z'),
        new Date('2026-01-01T00:00:00.000Z'),
      ),
    );

    await expect(
      useCase.execute('org-1', {
        customerId: 'customer-1',
        items: [{ productId: 'product-1', quantity: 1 }],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects missing customers', async () => {
    customerRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('org-1', {
        customerId: 'missing-customer',
        items: [{ productId: 'product-1', quantity: 1 }],
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('persists product snapshots with the order items', async () => {
    customerRepository.findById.mockResolvedValue(
      new CustomerEntity(
        'customer-1',
        'org-1',
        'Customer',
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
        new Decimal(25),
        10,
        ProductStatus.ACTIVE,
        new Date('2026-01-01T00:00:00.000Z'),
        new Date('2026-01-01T00:00:00.000Z'),
      ),
    );
    orderRepository.create.mockResolvedValue(buildOrder());

    await useCase.execute('org-1', {
      customerId: 'customer-1',
      items: [{ productId: 'product-1', quantity: 2 }],
    });

    expect(orderRepository.create).toHaveBeenCalledWith({
      organizationId: 'org-1',
      customerId: 'customer-1',
      items: [
        {
          productId: 'product-1',
          productName: 'Product One',
          productSku: 'SKU-1',
          productDescription: 'Snapshot description',
          quantity: 2,
          unitPrice: new Decimal(25),
        },
      ],
    });
  });
});
