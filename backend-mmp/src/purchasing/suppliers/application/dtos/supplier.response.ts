import { SupplierEntity } from '../../domain/supplier.entity';

export class SupplierResponse {
  id: string;
  organizationId: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  taxId: string | null;
  address: string | null;
  createdAt: Date;
  updatedAt: Date;

  static from(entity: SupplierEntity): SupplierResponse {
    const dto = new SupplierResponse();
    dto.id = entity.id;
    dto.organizationId = entity.organizationId;
    dto.name = entity.name;
    dto.contactName = entity.contactName;
    dto.email = entity.email;
    dto.phone = entity.phone;
    dto.taxId = entity.taxId;
    dto.address = entity.address;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
