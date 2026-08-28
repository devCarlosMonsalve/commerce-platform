import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { SupplierEntity } from '../../domain/supplier.entity';
import { ISupplierRepository } from '../../domain/supplier.repository';

@Injectable()
export class PrismaSupplierRepository implements ISupplierRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<SupplierEntity | null> {
    const supplier = await this.prisma.supplier.findUnique({ where: { id } });
    return supplier ? this.toEntity(supplier) : null;
  }

  async findAllByOrganization(
    organizationId: string,
  ): Promise<SupplierEntity[]> {
    const suppliers = await this.prisma.supplier.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });

    return suppliers.map((supplier) => this.toEntity(supplier));
  }

  async create(data: {
    organizationId: string;
    name: string;
    contactName?: string;
    email?: string;
    phone?: string;
    taxId?: string;
    address?: string;
  }): Promise<SupplierEntity> {
    const supplier = await this.prisma.supplier.create({
      data: {
        organizationId: data.organizationId,
        name: data.name,
        contactName: data.contactName,
        email: data.email,
        phone: data.phone,
        taxId: data.taxId,
        address: data.address,
      },
    });

    return this.toEntity(supplier);
  }

  async update(
    id: string,
    data: {
      name?: string;
      contactName?: string;
      email?: string;
      phone?: string;
      taxId?: string;
      address?: string;
    },
  ): Promise<SupplierEntity> {
    const supplier = await this.prisma.supplier.update({
      where: { id },
      data: {
        name: data.name,
        contactName: data.contactName,
        email: data.email,
        phone: data.phone,
        taxId: data.taxId,
        address: data.address,
      },
    });

    return this.toEntity(supplier);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.supplier.delete({ where: { id } });
  }

  private toEntity(supplier: {
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
  }): SupplierEntity {
    return new SupplierEntity(
      supplier.id,
      supplier.organizationId,
      supplier.name,
      supplier.contactName,
      supplier.email,
      supplier.phone,
      supplier.taxId,
      supplier.address,
      supplier.createdAt,
      supplier.updatedAt,
    );
  }
}
