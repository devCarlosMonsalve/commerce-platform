import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CustomerEntity } from '../../domain/customer.entity';
import { ICustomerRepository } from '../../domain/customer.repository';

@Injectable()
export class PrismaCustomerRepository implements ICustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<CustomerEntity | null> {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    return customer ? this.toEntity(customer) : null;
  }

  async findAllByOrganization(organizationId: string): Promise<CustomerEntity[]> {
    const customers = await this.prisma.customer.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });

    return customers.map((customer) => this.toEntity(customer));
  }

  async create(data: {
    organizationId: string;
    name: string;
    email?: string;
    phone?: string;
  }): Promise<CustomerEntity> {
    const customer = await this.prisma.customer.create({
      data: {
        organizationId: data.organizationId,
        name: data.name,
        email: data.email,
        phone: data.phone,
      },
    });

    return this.toEntity(customer);
  }

  async update(id: string, data: {
    name?: string;
    email?: string;
    phone?: string;
  }): Promise<CustomerEntity> {
    const customer = await this.prisma.customer.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
      },
    });

    return this.toEntity(customer);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.customer.delete({ where: { id } });
  }

  private toEntity(customer: {
    id: string;
    organizationId: string;
    name: string;
    email: string | null;
    phone: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): CustomerEntity {
    return new CustomerEntity(
      customer.id,
      customer.organizationId,
      customer.name,
      customer.email,
      customer.phone,
      customer.createdAt,
      customer.updatedAt,
    );
  }
}
