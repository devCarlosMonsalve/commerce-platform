import { Inject, Injectable } from '@nestjs/common';
import { SupplierEntity } from '../../domain/supplier.entity';
import { SUPPLIER_REPOSITORY } from '../../domain/supplier.repository';
import type { ISupplierRepository } from '../../domain/supplier.repository';

@Injectable()
export class ListSuppliersUseCase {
  constructor(
    @Inject(SUPPLIER_REPOSITORY)
    private readonly supplierRepository: ISupplierRepository,
  ) {}

  execute(organizationId: string): Promise<SupplierEntity[]> {
    return this.supplierRepository.findAllByOrganization(organizationId);
  }
}
