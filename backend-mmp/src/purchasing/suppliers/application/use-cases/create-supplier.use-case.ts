import { Inject, Injectable } from '@nestjs/common';
import { SupplierEntity } from '../../domain/supplier.entity';
import { SUPPLIER_REPOSITORY } from '../../domain/supplier.repository';
import type { ISupplierRepository } from '../../domain/supplier.repository';
import { CreateSupplierDto } from '../dtos/create-supplier.dto';

@Injectable()
export class CreateSupplierUseCase {
  constructor(
    @Inject(SUPPLIER_REPOSITORY)
    private readonly supplierRepository: ISupplierRepository,
  ) {}

  execute(
    organizationId: string,
    dto: CreateSupplierDto,
  ): Promise<SupplierEntity> {
    return this.supplierRepository.create({
      organizationId,
      name: dto.name,
      contactName: dto.contactName,
      email: dto.email,
      phone: dto.phone,
      taxId: dto.taxId,
      address: dto.address,
    });
  }
}
