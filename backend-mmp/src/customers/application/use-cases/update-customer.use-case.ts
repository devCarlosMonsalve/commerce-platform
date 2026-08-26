import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CustomerEntity } from '../../domain/customer.entity';
import { CUSTOMER_REPOSITORY } from '../../domain/customer.repository';
import type { ICustomerRepository } from '../../domain/customer.repository';
import { UpdateCustomerDto } from '../dtos/update-customer.dto';

@Injectable()
export class UpdateCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(
    organizationId: string,
    customerId: string,
    dto: UpdateCustomerDto,
  ): Promise<CustomerEntity> {
    const customer = await this.customerRepository.findById(customerId);
    if (!customer || customer.organizationId !== organizationId) {
      throw new NotFoundException('Customer not found');
    }

    return this.customerRepository.update(customerId, {
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
    });
  }
}
