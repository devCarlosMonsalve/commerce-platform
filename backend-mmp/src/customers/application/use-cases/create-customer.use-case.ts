import { Inject, Injectable } from '@nestjs/common';
import { CustomerEntity } from '../../domain/customer.entity';
import { CUSTOMER_REPOSITORY } from '../../domain/customer.repository';
import type { ICustomerRepository } from '../../domain/customer.repository';
import { CreateCustomerDto } from '../dtos/create-customer.dto';

@Injectable()
export class CreateCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  execute(organizationId: string, dto: CreateCustomerDto): Promise<CustomerEntity> {
    return this.customerRepository.create({
      organizationId,
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
    });
  }
}
