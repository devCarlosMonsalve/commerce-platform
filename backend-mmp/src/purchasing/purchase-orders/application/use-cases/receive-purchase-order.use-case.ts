import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PurchaseOrderDomainError } from '../../domain/purchase-order-domain.error';
import { PurchaseOrderEntity } from '../../domain/purchase-order.entity';
import { PURCHASE_ORDER_REPOSITORY } from '../../domain/purchase-order.repository';
import type { IPurchaseOrderRepository } from '../../domain/purchase-order.repository';
import { ReceivePurchaseOrderDto } from '../dtos/receive-purchase-order.dto';

@Injectable()
export class ReceivePurchaseOrderUseCase {
  constructor(
    @Inject(PURCHASE_ORDER_REPOSITORY)
    private readonly purchaseOrderRepository: IPurchaseOrderRepository,
  ) {}

  async execute(
    organizationId: string,
    purchaseOrderId: string,
    dto: ReceivePurchaseOrderDto,
  ): Promise<PurchaseOrderEntity> {
    const purchaseOrder =
      await this.purchaseOrderRepository.findById(purchaseOrderId);
    if (!purchaseOrder || purchaseOrder.organizationId !== organizationId) {
      throw new NotFoundException('Purchase order not found');
    }

    try {
      purchaseOrder.receive(dto.items);
      return await this.purchaseOrderRepository.recordReceipt(
        purchaseOrderId,
        organizationId,
        dto,
      );
    } catch (error) {
      if (error instanceof PurchaseOrderDomainError) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }
}
