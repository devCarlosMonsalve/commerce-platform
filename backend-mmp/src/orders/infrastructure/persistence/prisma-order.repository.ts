import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../../../prisma/prisma.service';
import { OrderItemEntity } from '../../domain/order-item.entity';
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

  async updateStatus(id: string, status: OrderStatus): Promise<OrderEntity> {
    const order = await this.prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });

    return this.toEntity(order);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.order.delete({ where: { id } });
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
