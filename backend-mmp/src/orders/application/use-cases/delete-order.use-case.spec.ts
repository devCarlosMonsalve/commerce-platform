import { BadRequestException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { OrderItemEntity } from '../../domain/order-item.entity';
import type { IOrderRepository } from '../../domain/order.repository';
import { OrderEntity } from '../../domain/order.entity';
import { DeleteOrderUseCase } from './delete-order.use-case';

const buildOrder = (status: OrderStatus) =>
  new OrderEntity(
    'order-1',
    'org-1',
    'customer-1',
    status,
    new Decimal(10),
    [
      new OrderItemEntity(
        'item-1',
        'order-1',
        'product-1',
        'Product One',
        'SKU-1',
        null,
        1,
        new Decimal(10),
        new Decimal(10),
        new Date('2026-01-01T00:00:00.000Z'),
        new Date('2026-01-01T00:00:00.000Z'),
      ),
    ],
    new Date('2026-01-01T00:00:00.000Z'),
    new Date('2026-01-01T00:00:00.000Z'),
  );

describe('DeleteOrderUseCase', () => {
  const orderRepository: jest.Mocked<IOrderRepository> = {
    findById: jest.fn(),
    findAllByOrganization: jest.fn(),
    create: jest.fn(),
    updateStatus: jest.fn(),
    delete: jest.fn(),
  };

  const useCase = new DeleteOrderUseCase(orderRepository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([OrderStatus.CANCELLED, OrderStatus.COMPLETED])(
    'rejects deleting %s orders',
    async (status) => {
      orderRepository.findById.mockResolvedValue(buildOrder(status));

      await expect(useCase.execute('org-1', 'order-1')).rejects.toThrow(BadRequestException);
      expect(orderRepository.delete).not.toHaveBeenCalled();
    },
  );
});
