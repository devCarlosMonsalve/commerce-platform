import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { PRODUCT_REPOSITORY } from '../../../products/domain/product.repository';
import type { IProductRepository } from '../../../products/domain/product.repository';
import { OrderEntity } from '../../domain/order.entity';
import { ORDER_REPOSITORY } from '../../domain/order.repository';
import type { IOrderRepository } from '../../domain/order.repository';
import { CreateOrderDto } from '../dtos/create-order.dto';

@Injectable()
export class CreateOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orderRepository: IOrderRepository,
    @Inject(PRODUCT_REPOSITORY) private readonly productRepository: IProductRepository,
  ) {}

  async execute(organizationId: string, dto: CreateOrderDto): Promise<OrderEntity> {
    if (dto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    const resolvedItems: { productId: string; quantity: number; unitPrice: Decimal }[] = [];

    for (const item of dto.items) {
      const product = await this.productRepository.findById(item.productId);

      if (!product) throw new NotFoundException(`Product ${item.productId} not found`);
      if (product.organizationId !== organizationId)
        throw new BadRequestException(`Product ${item.productId} does not belong to this organization`);
      if (product.status !== 'ACTIVE')
        throw new BadRequestException(`Product ${item.productId} is not active`);

      resolvedItems.push({ productId: item.productId, quantity: item.quantity, unitPrice: product.price });
    }

    return this.orderRepository.create({ organizationId, customerId: dto.customerId, items: resolvedItems });
  }
}
