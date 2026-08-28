import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SUPPLIER_REPOSITORY } from '../../domain/supplier.repository';
import type { ISupplierRepository } from '../../domain/supplier.repository';

@Injectable()
export class DeleteSupplierUseCase {
  constructor(
    @Inject(SUPPLIER_REPOSITORY)
    private readonly supplierRepository: ISupplierRepository,
  ) {}

  async execute(organizationId: string, supplierId: string): Promise<void> {
    const supplier = await this.supplierRepository.findById(supplierId);
    if (!supplier || supplier.organizationId !== organizationId) {
      throw new NotFoundException('Supplier not found');
    }

    await this.supplierRepository.delete(supplierId);
  }
}
