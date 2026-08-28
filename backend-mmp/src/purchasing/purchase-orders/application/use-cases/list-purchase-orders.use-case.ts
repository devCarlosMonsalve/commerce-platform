import { Inject, Injectable } from '@nestjs/common';
import { PurchaseOrderEntity } from '../../domain/purchase-order.entity';
import { PURCHASE_ORDER_REPOSITORY } from '../../domain/purchase-order.repository';
import type { IPurchaseOrderRepository } from '../../domain/purchase-order.repository';

@Injectable()
export class ListPurchaseOrdersUseCase {
  constructor(
    @Inject(PURCHASE_ORDER_REPOSITORY)
    private readonly purchaseOrderRepository: IPurchaseOrderRepository,
  ) {}

  execute(organizationId: string): Promise<PurchaseOrderEntity[]> {
    return this.purchaseOrderRepository.findAllByOrganization(organizationId);
  }
}
