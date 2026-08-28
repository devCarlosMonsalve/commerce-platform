import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SupplierEntity } from '../../domain/supplier.entity';
import { SUPPLIER_REPOSITORY } from '../../domain/supplier.repository';
import type { ISupplierRepository } from '../../domain/supplier.repository';
import { UpdateSupplierDto } from '../dtos/update-supplier.dto';

@Injectable()
export class UpdateSupplierUseCase {
  constructor(
    @Inject(SUPPLIER_REPOSITORY)
    private readonly supplierRepository: ISupplierRepository,
  ) {}

  async execute(
    organizationId: string,
    supplierId: string,
    dto: UpdateSupplierDto,
  ): Promise<SupplierEntity> {
    const supplier = await this.supplierRepository.findById(supplierId);
    if (!supplier || supplier.organizationId !== organizationId) {
      throw new NotFoundException('Supplier not found');
    }

    return this.supplierRepository.update(supplierId, {
      name: dto.name,
      contactName: dto.contactName,
      email: dto.email,
      phone: dto.phone,
      taxId: dto.taxId,
      address: dto.address,
    });
  }
}
