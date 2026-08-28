import { OrderStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { OrderItemEntity } from './order-item.entity';
import { OrderDomainError } from './order-domain.error';
import { OrderEntity } from './order.entity';

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

describe('OrderEntity', () => {
  it('transitions through the valid lifecycle', () => {
    const pendingOrder = buildOrder(OrderStatus.DRAFT).submit();
    const confirmedOrder = pendingOrder.confirm();
    const completedOrder = confirmedOrder.complete();

    expect(pendingOrder.status).toBe(OrderStatus.PENDING);
    expect(confirmedOrder.status).toBe(OrderStatus.CONFIRMED);
    expect(completedOrder.status).toBe(OrderStatus.COMPLETED);
  });

  it.each([OrderStatus.DRAFT, OrderStatus.PENDING, OrderStatus.CONFIRMED])(
    'allows cancelling an order in %s status',
    (status) => {
      expect(buildOrder(status).cancel().status).toBe(OrderStatus.CANCELLED);
    },
  );

  it('rejects confirming an order without items', () => {
    expect(() => buildOrder(OrderStatus.PENDING, []).confirm()).toThrow(OrderDomainError);
  });

  it.each([
    () => buildOrder(OrderStatus.DRAFT).confirm(),
    () => buildOrder(OrderStatus.DRAFT).complete(),
    () => buildOrder(OrderStatus.COMPLETED).cancel(),
    () => buildOrder(OrderStatus.CANCELLED).submit(),
  ])('rejects invalid transitions', (transition) => {
    expect(transition).toThrow(OrderDomainError);
  });

  it.each([OrderStatus.CANCELLED, OrderStatus.COMPLETED])(
    'prevents deleting an order in %s status',
    (status) => {
      expect(() => buildOrder(status).assertCanBeDeleted()).toThrow(OrderDomainError);
    },
  );
});
