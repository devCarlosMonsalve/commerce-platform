import { CustomerEntity } from '../../domain/customer.entity';

export class CustomerResponse {
  id: string;
  organizationId: string;
  name: string;
  email: string | null;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;

  static from(entity: CustomerEntity): CustomerResponse {
    const dto = new CustomerResponse();
    dto.id = entity.id;
    dto.organizationId = entity.organizationId;
    dto.name = entity.name;
    dto.email = entity.email;
    dto.phone = entity.phone;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
