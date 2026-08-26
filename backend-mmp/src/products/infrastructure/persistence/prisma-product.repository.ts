import { Injectable } from '@nestjs/common';
import { ProductStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../../../prisma/prisma.service';
import { ProductEntity } from '../../domain/product.entity';
import { IProductRepository } from '../../domain/product.repository';

@Injectable()
export class PrismaProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<ProductEntity | null> {
    const product = await this.prisma.product.findUnique({ where: { id } });
    return product ? this.toEntity(product) : null;
  }

  async findAllByOrganization(organizationId: string): Promise<ProductEntity[]> {
    const products = await this.prisma.product.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });

    return products.map((product) => this.toEntity(product));
  }

  async create(data: {
    organizationId: string;
    name: string;
    description?: string;
    sku?: string;
    price: Decimal;
    stock?: number;
  }): Promise<ProductEntity> {
    const product = await this.prisma.product.create({
      data: {
        organizationId: data.organizationId,
        name: data.name,
        description: data.description,
        sku: data.sku,
        price: data.price,
        stock: data.stock ?? 0,
      },
    });

    return this.toEntity(product);
  }

  async update(id: string, data: {
    name?: string;
    description?: string;
    sku?: string;
    price?: Decimal;
    stock?: number;
    status?: ProductStatus;
  }): Promise<ProductEntity> {
    const product = await this.prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        sku: data.sku,
        price: data.price,
        stock: data.stock,
        status: data.status,
      },
    });

    return this.toEntity(product);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({ where: { id } });
  }

  private toEntity(product: {
    id: string;
    organizationId: string;
    name: string;
    description: string | null;
    sku: string | null;
    price: Decimal;
    stock: number;
    status: ProductStatus;
    createdAt: Date;
    updatedAt: Date;
  }): ProductEntity {
    return new ProductEntity(
      product.id,
      product.organizationId,
      product.name,
      product.description,
      product.sku,
      product.price,
      product.stock,
      product.status,
      product.createdAt,
      product.updatedAt,
    );
  }
}
