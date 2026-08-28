import { OrderStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../../../prisma/prisma.service';
import { OrderItemEntity } from '../../domain/order-item.entity';
import { OrderDomainError } from '../../domain/order-domain.error';
import { OrderEntity } from '../../domain/order.entity';
import { PrismaOrderRepository } from './prisma-order.repository';

const buildItem = (overrides?: Partial<{ productId: string; quantity: number }>) =>
  new OrderItemEntity(
    `item-${overrides?.productId ?? 'product-1'}-${overrides?.quantity ?? 1}`,
    'order-1',
    overrides?.productId ?? 'product-1',
    'Product One',
    'SKU-1',
    'Historic description',
    overrides?.quantity ?? 1,
    new Decimal(10),
    new Decimal(10).mul(overrides?.quantity ?? 1),
    new Date('2026-01-01T00:00:00.000Z'),
    new Date('2026-01-01T00:00:00.000Z'),
  );

const buildOrder = (status: OrderStatus, items: OrderItemEntity[]) =>
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

const buildPersistedOrder = (status: OrderStatus, items: OrderItemEntity[]) => ({
  id: 'order-1',
  organizationId: 'org-1',
  customerId: 'customer-1',
  status,
  total: new Decimal(10),
  items: items.map((item) => ({
    id: item.id,
    orderId: item.orderId,
    productId: item.productId,
    productName: item.productName,
    productSku: item.productSku,
    productDescription: item.productDescription,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    total: item.total,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  })),
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-02T00:00:00.000Z'),
});

describe('PrismaOrderRepository', () => {
  const tx = {
    product: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
    order: {
      updateMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const prisma = {
    $transaction: jest.fn(),
  } as unknown as PrismaService;

  const repository = new PrismaOrderRepository(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => callback(tx));
  });

  it('decrements product stock when confirming a pending order', async () => {
    const items = [buildItem({ quantity: 1 }), buildItem({ quantity: 2 })];
    const order = buildOrder(OrderStatus.CONFIRMED, items);

    tx.product.findMany.mockResolvedValue([{ id: 'product-1' }]);
    tx.product.updateMany.mockResolvedValue({ count: 1 });
    tx.order.updateMany.mockResolvedValue({ count: 1 });
    tx.order.findUnique.mockResolvedValue(buildPersistedOrder(OrderStatus.CONFIRMED, items));

    const updatedOrder = await repository.updateStatus(order, OrderStatus.PENDING);

    expect(tx.product.updateMany).toHaveBeenCalledTimes(1);
    expect(tx.product.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'product-1',
        organizationId: 'org-1',
        stock: { gte: 3 },
      },
      data: {
        stock: { decrement: 3 },
      },
    });
    expect(tx.order.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'order-1',
        organizationId: 'org-1',
        status: OrderStatus.PENDING,
      },
      data: { status: OrderStatus.CONFIRMED },
    });
    expect(updatedOrder.status).toBe(OrderStatus.CONFIRMED);
  });

  it('rejects confirmation when any product stock is insufficient', async () => {
    const items = [buildItem({ quantity: 2 })];
    const order = buildOrder(OrderStatus.CONFIRMED, items);

    tx.product.findMany.mockResolvedValue([{ id: 'product-1' }]);
    tx.product.updateMany.mockResolvedValue({ count: 0 });

    await expect(repository.updateStatus(order, OrderStatus.PENDING)).rejects.toThrow(
      new OrderDomainError('Insufficient stock for product "Product One"'),
    );

    expect(tx.order.updateMany).not.toHaveBeenCalled();
    expect(tx.order.findUnique).not.toHaveBeenCalled();
  });

  it('replenishes stock when cancelling a confirmed order', async () => {
    const items = [buildItem({ quantity: 2 })];
    const order = buildOrder(OrderStatus.CANCELLED, items);

    tx.product.findMany.mockResolvedValue([{ id: 'product-1' }]);
    tx.product.updateMany.mockResolvedValue({ count: 1 });
    tx.order.updateMany.mockResolvedValue({ count: 1 });
    tx.order.findUnique.mockResolvedValue(buildPersistedOrder(OrderStatus.CANCELLED, items));

    const updatedOrder = await repository.updateStatus(order, OrderStatus.CONFIRMED);

    expect(tx.product.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'product-1',
        organizationId: 'org-1',
      },
      data: {
        stock: { increment: 2 },
      },
    });
    expect(updatedOrder.status).toBe(OrderStatus.CANCELLED);
  });

  it('does not replenish stock when cancelling a pending order', async () => {
    const items = [buildItem({ quantity: 2 })];
    const order = buildOrder(OrderStatus.CANCELLED, items);

    tx.order.updateMany.mockResolvedValue({ count: 1 });
    tx.order.findUnique.mockResolvedValue(buildPersistedOrder(OrderStatus.CANCELLED, items));

    const updatedOrder = await repository.updateStatus(order, OrderStatus.PENDING);

    expect(tx.product.findMany).not.toHaveBeenCalled();
    expect(tx.product.updateMany).not.toHaveBeenCalled();
    expect(updatedOrder.status).toBe(OrderStatus.CANCELLED);
  });
});
