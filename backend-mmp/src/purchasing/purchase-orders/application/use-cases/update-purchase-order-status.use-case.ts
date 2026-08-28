import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PurchaseOrderStatus } from '@prisma/client';
import { PurchaseOrderDomainError } from '../../domain/purchase-order-domain.error';
import { PurchaseOrderEntity } from '../../domain/purchase-order.entity';
import { PURCHASE_ORDER_REPOSITORY } from '../../domain/purchase-order.repository';
import type { IPurchaseOrderRepository } from '../../domain/purchase-order.repository';
import { UpdatePurchaseOrderStatusDto } from '../dtos/update-purchase-order-status.dto';

@Injectable()
export class UpdatePurchaseOrderStatusUseCase {
  constructor(
    @Inject(PURCHASE_ORDER_REPOSITORY)
    private readonly purchaseOrderRepository: IPurchaseOrderRepository,
  ) {}

  async execute(
    organizationId: string,
    purchaseOrderId: string,
    dto: UpdatePurchaseOrderStatusDto,
  ): Promise<PurchaseOrderEntity> {
    const purchaseOrder =
      await this.purchaseOrderRepository.findById(purchaseOrderId);
    if (!purchaseOrder || purchaseOrder.organizationId !== organizationId) {
      throw new NotFoundException('Purchase order not found');
    }

    try {
      const updatedPurchaseOrder = this.applyStatusTransition(
        purchaseOrder,
        dto.status,
      );
      return await this.purchaseOrderRepository.updateStatus(
        updatedPurchaseOrder,
        purchaseOrder.status,
      );
    } catch (error) {
      if (error instanceof PurchaseOrderDomainError) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }

  private applyStatusTransition(
    purchaseOrder: PurchaseOrderEntity,
    status: PurchaseOrderStatus,
  ): PurchaseOrderEntity {
    switch (status) {
      case PurchaseOrderStatus.ORDERED:
        return purchaseOrder.order();
      case PurchaseOrderStatus.CANCELLED:
        return purchaseOrder.cancel();
      default:
        throw new PurchaseOrderDomainError(
          `Cannot transition purchase order from ${purchaseOrder.status} to ${status}`,
        );
    }
  }
}
