import { BadRequestException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { OrderItemEntity } from '../../domain/order-item.entity';
import type { IOrderRepository } from '../../domain/order.repository';
import { OrderEntity } from '../../domain/order.entity';
import { UpdateOrderStatusUseCase } from './update-order-status.use-case';

const buildOrder = (status: OrderStatus, items: OrderItemEntity[] = [buildItem()]) =>
  new OrderEntity(
    'order-1',
    'org-1',
    'customer-1',
    status,
    new Decimal(10),
    items,
    new Date('2026-01-01T00:00:00.000Z'),
    new Date('2026-01-01T00:00:00.000Z'),
  );

function buildItem() {
  return new OrderItemEntity(
    'item-1',
    'order-1',
    'product-1',
    'Product One',
    'SKU-1',
    'Historic description',
    1,
    new Decimal(10),
    new Decimal(10),
    new Date('2026-01-01T00:00:00.000Z'),
    new Date('2026-01-01T00:00:00.000Z'),
  );
}

describe('UpdateOrderStatusUseCase', () => {
  const orderRepository: jest.Mocked<IOrderRepository> = {
    findById: jest.fn(),
    findAllByOrganization: jest.fn(),
    create: jest.fn(),
    updateStatus: jest.fn(),
    delete: jest.fn(),
  };

  const useCase = new UpdateOrderStatusUseCase(orderRepository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses the order behavior for valid transitions', async () => {
    orderRepository.findById.mockResolvedValue(buildOrder(OrderStatus.DRAFT));
    orderRepository.updateStatus.mockResolvedValue(buildOrder(OrderStatus.PENDING));

    const updatedOrder = await useCase.execute('org-1', 'order-1', {
      status: OrderStatus.PENDING,
    });

    expect(orderRepository.updateStatus).toHaveBeenCalledWith('order-1', OrderStatus.PENDING);
    expect(updatedOrder.status).toBe(OrderStatus.PENDING);
  });

  it('rejects invalid lifecycle transitions', async () => {
    orderRepository.findById.mockResolvedValue(buildOrder(OrderStatus.DRAFT));

    await expect(
      useCase.execute('org-1', 'order-1', {
        status: OrderStatus.COMPLETED,
      }),
    ).rejects.toThrow(BadRequestException);

    expect(orderRepository.updateStatus).not.toHaveBeenCalled();
  });
});
