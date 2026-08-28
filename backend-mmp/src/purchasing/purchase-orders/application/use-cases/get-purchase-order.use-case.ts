import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PurchaseOrderEntity } from '../../domain/purchase-order.entity';
import { PURCHASE_ORDER_REPOSITORY } from '../../domain/purchase-order.repository';
import type { IPurchaseOrderRepository } from '../../domain/purchase-order.repository';

@Injectable()
export class GetPurchaseOrderUseCase {
  constructor(
    @Inject(PURCHASE_ORDER_REPOSITORY)
    private readonly purchaseOrderRepository: IPurchaseOrderRepository,
  ) {}

  async execute(
    organizationId: string,
    purchaseOrderId: string,
  ): Promise<PurchaseOrderEntity> {
    const purchaseOrder =
      await this.purchaseOrderRepository.findById(purchaseOrderId);
    if (!purchaseOrder || purchaseOrder.organizationId !== organizationId) {
      throw new NotFoundException('Purchase order not found');
    }

    return purchaseOrder;
  }
}
