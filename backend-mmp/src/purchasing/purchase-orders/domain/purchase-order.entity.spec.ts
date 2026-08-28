import { PurchaseOrderStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PurchaseOrderDomainError } from './purchase-order-domain.error';
import { PurchaseOrderEntity } from './purchase-order.entity';
import { PurchaseOrderItemEntity } from './purchase-order-item.entity';

const buildItem = (
  overrides?: Partial<{
    id: string;
    orderedQuantity: number;
    receivedQuantity: number;
  }>,
) =>
  new PurchaseOrderItemEntity(
    overrides?.id ?? 'item-1',
    'purchase-order-1',
    'product-1',
    'Product One',
    'SKU-1',
    'Historic description',
    overrides?.orderedQuantity ?? 5,
    overrides?.receivedQuantity ?? 0,
    new Decimal(10),
    new Decimal(10).mul(overrides?.orderedQuantity ?? 5),
    new Date('2026-01-01T00:00:00.000Z'),
    new Date('2026-01-01T00:00:00.000Z'),
  );

const buildOrder = (
  status: PurchaseOrderStatus = PurchaseOrderStatus.DRAFT,
  items: PurchaseOrderItemEntity[] = [buildItem()],
) =>
  new PurchaseOrderEntity(
    'purchase-order-1',
    'org-1',
    'supplier-1',
    status,
    new Decimal(50),
    items,
    [],
    null,
    null,
    new Date('2026-01-01T00:00:00.000Z'),
    new Date('2026-01-01T00:00:00.000Z'),
  );

describe('PurchaseOrderEntity', () => {
  it('moves from draft to ordered and then through partial/full receipt states', () => {
    const ordered = buildOrder().order();
    const partiallyReceived = ordered.receive([
      { purchaseOrderItemId: 'item-1', quantity: 2 },
    ]);
    const received = partiallyReceived.receive([
      { purchaseOrderItemId: 'item-1', quantity: 3 },
    ]);

    expect(ordered.status).toBe(PurchaseOrderStatus.ORDERED);
    expect(partiallyReceived.status).toBe(
      PurchaseOrderStatus.PARTIALLY_RECEIVED,
    );
    expect(partiallyReceived.items[0].receivedQuantity).toBe(2);
    expect(received.status).toBe(PurchaseOrderStatus.RECEIVED);
    expect(received.items[0].receivedQuantity).toBe(5);
  });

  it.each([
    () =>
      buildOrder().receive([{ purchaseOrderItemId: 'item-1', quantity: 1 }]),
    () => buildOrder(PurchaseOrderStatus.ORDERED).order(),
    () =>
      buildOrder(PurchaseOrderStatus.PARTIALLY_RECEIVED, [
        buildItem({ receivedQuantity: 1 }),
      ]).cancel(),
    () =>
      buildOrder(PurchaseOrderStatus.RECEIVED, [
        buildItem({ receivedQuantity: 5 }),
      ]).cancel(),
  ])('rejects invalid lifecycle operations', (transition) => {
    expect(transition).toThrow(PurchaseOrderDomainError);
  });

  it('rejects over-receiving an order item', () => {
    expect(() =>
      buildOrder(PurchaseOrderStatus.ORDERED).receive([
        { purchaseOrderItemId: 'item-1', quantity: 6 },
      ]),
    ).toThrow(
      new PurchaseOrderDomainError(
        'Received quantity for product "Product One" exceeds ordered quantity',
      ),
    );
  });
});
