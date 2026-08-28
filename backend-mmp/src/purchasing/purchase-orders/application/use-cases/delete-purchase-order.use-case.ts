import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PurchaseOrderDomainError } from '../../domain/purchase-order-domain.error';
import { PURCHASE_ORDER_REPOSITORY } from '../../domain/purchase-order.repository';
import type { IPurchaseOrderRepository } from '../../domain/purchase-order.repository';

@Injectable()
export class DeletePurchaseOrderUseCase {
  constructor(
    @Inject(PURCHASE_ORDER_REPOSITORY)
    private readonly purchaseOrderRepository: IPurchaseOrderRepository,
  ) {}

  async execute(
    organizationId: string,
    purchaseOrderId: string,
  ): Promise<void> {
    const purchaseOrder =
      await this.purchaseOrderRepository.findById(purchaseOrderId);
    if (!purchaseOrder || purchaseOrder.organizationId !== organizationId) {
      throw new NotFoundException('Purchase order not found');
    }

    try {
      purchaseOrder.assertCanBeDeleted();
    } catch (error) {
      if (error instanceof PurchaseOrderDomainError) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }

    await this.purchaseOrderRepository.delete(purchaseOrderId);
  }
}
