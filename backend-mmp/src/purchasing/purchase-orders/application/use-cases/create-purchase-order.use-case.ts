import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PRODUCT_REPOSITORY } from '../../../../products/domain/product.repository';
import type { IProductRepository } from '../../../../products/domain/product.repository';
import { PurchaseOrderEntity } from '../../domain/purchase-order.entity';
import { PURCHASE_ORDER_REPOSITORY } from '../../domain/purchase-order.repository';
import type { IPurchaseOrderRepository } from '../../domain/purchase-order.repository';
import { SUPPLIER_REPOSITORY } from '../../../suppliers/domain/supplier.repository';
import type { ISupplierRepository } from '../../../suppliers/domain/supplier.repository';
import { CreatePurchaseOrderDto } from '../dtos/create-purchase-order.dto';

@Injectable()
export class CreatePurchaseOrderUseCase {
  constructor(
    @Inject(PURCHASE_ORDER_REPOSITORY)
    private readonly purchaseOrderRepository: IPurchaseOrderRepository,
    @Inject(SUPPLIER_REPOSITORY)
    private readonly supplierRepository: ISupplierRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(
    organizationId: string,
    dto: CreatePurchaseOrderDto,
  ): Promise<PurchaseOrderEntity> {
    if (dto.items.length === 0) {
      throw new BadRequestException(
        'Purchase order must contain at least one item',
      );
    }

    const supplier = await this.supplierRepository.findById(dto.supplierId);
    if (!supplier) {
      throw new NotFoundException(`Supplier ${dto.supplierId} not found`);
    }
    if (supplier.organizationId !== organizationId) {
      throw new BadRequestException(
        `Supplier ${dto.supplierId} does not belong to this organization`,
      );
    }

    const resolvedItems = await Promise.all(
      dto.items.map(async (item) => {
        const product = await this.productRepository.findById(item.productId);

        if (!product) {
          throw new NotFoundException(`Product ${item.productId} not found`);
        }
        if (product.organizationId !== organizationId) {
          throw new BadRequestException(
            `Product ${item.productId} does not belong to this organization`,
          );
        }
        if (product.status !== ProductStatus.ACTIVE) {
          throw new BadRequestException(
            `Product ${item.productId} is not active`,
          );
        }

        return {
          productId: item.productId,
          productName: product.name,
          productSku: product.sku,
          productDescription: product.description,
          orderedQuantity: item.quantity,
          unitCost: new Decimal(item.unitCost),
        };
      }),
    );

    return this.purchaseOrderRepository.create({
      organizationId,
      supplierId: dto.supplierId,
      items: resolvedItems,
    });
  }
}
