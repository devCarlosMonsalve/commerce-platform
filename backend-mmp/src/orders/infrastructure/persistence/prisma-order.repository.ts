import { Injectable } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../../../prisma/prisma.service';
import { OrderItemEntity } from '../../domain/order-item.entity';
import { OrderDomainError } from '../../domain/order-domain.error';
import { OrderEntity } from '../../domain/order.entity';
import { IOrderRepository } from '../../domain/order.repository';

@Injectable()
export class PrismaOrderRepository implements IOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<OrderEntity | null> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    return order ? this.toEntity(order) : null;
  }

  async findAllByOrganization(organizationId: string): Promise<OrderEntity[]> {
    const orders = await this.prisma.order.findMany({
      where: { organizationId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((order) => this.toEntity(order));
  }

  async create(data: {
    organizationId: string;
    customerId: string;
    items: {
      productId: string;
      productName: string;
      productSku?: string | null;
      productDescription?: string | null;
      quantity: number;
      unitPrice: Decimal;
    }[];
  }): Promise<OrderEntity> {
    const total = data.items.reduce(
      (sum, item) => sum.plus(item.unitPrice.mul(item.quantity)),
      new Decimal(0),
    );

    const order = await this.prisma.$transaction(async (tx) =>
      tx.order.create({
        data: {
          organizationId: data.organizationId,
          customerId: data.customerId,
          total,
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              productSku: item.productSku,
              productDescription: item.productDescription,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.unitPrice.mul(item.quantity),
            })),
          },
        },
        include: { items: true },
      }),
    );

    return this.toEntity(order);
  }

  async updateStatus(order: OrderEntity, previousStatus: OrderStatus): Promise<OrderEntity> {
    const updatedOrder = await this.prisma.$transaction(async (tx) => {
      await this.adjustInventoryForTransition(tx, order, previousStatus);

      const updateResult = await tx.order.updateMany({
        where: {
          id: order.id,
          organizationId: order.organizationId,
          status: previousStatus,
        },
        data: { status: order.status },
      });

      if (updateResult.count !== 1) {
        throw new OrderDomainError('Order status changed before it could be updated');
      }

      const persistedOrder = await tx.order.findUnique({
        where: { id: order.id },
        include: { items: true },
      });

      if (!persistedOrder) {
        throw new OrderDomainError('Order not found after status update');
      }

      return persistedOrder;
    });

    return this.toEntity(updatedOrder);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.order.delete({ where: { id } });
  }

  private async adjustInventoryForTransition(
    tx: Prisma.TransactionClient,
    order: OrderEntity,
    previousStatus: OrderStatus,
  ): Promise<void> {
    const shouldDecrementStock =
      previousStatus === OrderStatus.PENDING && order.status === OrderStatus.CONFIRMED;
    const shouldReplenishStock =
      previousStatus === OrderStatus.CONFIRMED && order.status === OrderStatus.CANCELLED;

    if (!shouldDecrementStock && !shouldReplenishStock) {
      return;
    }

    const quantitiesByProduct = this.getItemQuantitiesByProduct(order.items);
    const productIds = [...quantitiesByProduct.keys()];

    if (productIds.length === 0) {
      return;
    }

    await this.assertProductsBelongToOrganization(tx, order.organizationId, productIds);

    for (const [productId, quantity] of quantitiesByProduct.entries()) {
      const result = shouldDecrementStock
        ? await tx.product.updateMany({
            where: {
              id: productId,
              organizationId: order.organizationId,
              stock: { gte: quantity },
            },
            data: {
              stock: { decrement: quantity },
            },
          })
        : await tx.product.updateMany({
            where: {
              id: productId,
              organizationId: order.organizationId,
            },
            data: {
              stock: { increment: quantity },
            },
          });

      if (result.count !== 1) {
        const productName = order.items.find((item) => item.productId === productId)?.productName;
        throw shouldDecrementStock
          ? new OrderDomainError(`Insufficient stock for product "${productName ?? productId}"`)
          : new OrderDomainError(`Product ${productId} does not belong to this organization`);
      }
    }
  }

  private async assertProductsBelongToOrganization(
    tx: Prisma.TransactionClient,
    organizationId: string,
    productIds: string[],
  ): Promise<void> {
    const products = await tx.product.findMany({
      where: {
        id: { in: productIds },
        organizationId,
      },
      select: { id: true },
    });

    if (products.length !== productIds.length) {
      throw new OrderDomainError('Order contains products that do not belong to this organization');
    }
  }

  private getItemQuantitiesByProduct(items: OrderItemEntity[]): Map<string, number> {
    return items.reduce((quantities, item) => {
      quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
      return quantities;
    }, new Map<string, number>());
  }

  private toEntity(order: {
    id: string;
    organizationId: string;
    customerId: string;
    status: OrderStatus;
    total: Decimal;
    items: {
      id: string;
      orderId: string;
      productId: string;
      productName: string;
      productSku: string | null;
      productDescription: string | null;
      quantity: number;
      unitPrice: Decimal;
      total: Decimal;
      createdAt: Date;
      updatedAt: Date;
    }[];
    createdAt: Date;
    updatedAt: Date;
  }): OrderEntity {
    return new OrderEntity(
      order.id,
      order.organizationId,
      order.customerId,
      order.status,
      order.total,
      order.items.map((item) => this.toItemEntity(item)),
      order.createdAt,
      order.updatedAt,
    );
  }

  private toItemEntity(item: {
    id: string;
    orderId: string;
    productId: string;
    productName: string;
    productSku: string | null;
    productDescription: string | null;
    quantity: number;
    unitPrice: Decimal;
    total: Decimal;
    createdAt: Date;
    updatedAt: Date;
  }): OrderItemEntity {
    return new OrderItemEntity(
      item.id,
      item.orderId,
      item.productId,
      item.productName,
      item.productSku,
      item.productDescription,
      item.quantity,
      item.unitPrice,
      item.total,
      item.createdAt,
      item.updatedAt,
    );
  }
}
