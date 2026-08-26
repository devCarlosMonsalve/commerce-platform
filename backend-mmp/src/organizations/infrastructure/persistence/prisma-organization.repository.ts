import { Injectable } from '@nestjs/common';
import { MembershipRole } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { MembershipEntity } from '../../domain/membership.entity';
import { OrganizationEntity } from '../../domain/organization.entity';
import { IOrganizationRepository } from '../../domain/organization.repository';

@Injectable()
export class PrismaOrganizationRepository implements IOrganizationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<OrganizationEntity | null> {
    const organization = await this.prisma.organization.findUnique({ where: { id } });
    return organization ? this.toOrganizationEntity(organization) : null;
  }

  async findBySlug(slug: string): Promise<OrganizationEntity | null> {
    const organization = await this.prisma.organization.findUnique({
      where: { slug },
    });
    return organization ? this.toOrganizationEntity(organization) : null;
  }

  async findAllByUserId(userId: string): Promise<OrganizationEntity[]> {
    const organizations = await this.prisma.organization.findMany({
      where: {
        memberships: {
          some: { userId },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return organizations.map((organization) =>
      this.toOrganizationEntity(organization),
    );
  }

  async create(data: {
    name: string;
    slug: string;
    userId: string;
  }): Promise<OrganizationEntity> {
    const organization = await this.prisma.$transaction(async (tx) => {
      const createdOrganization = await tx.organization.create({
        data: {
          name: data.name,
          slug: data.slug,
        },
      });

      await tx.membership.create({
        data: {
          userId: data.userId,
          organizationId: createdOrganization.id,
          role: MembershipRole.OWNER,
        },
      });

      return createdOrganization;
    });

    return this.toOrganizationEntity(organization);
  }

  async update(id: string, data: {
    name?: string;
    slug?: string;
  }): Promise<OrganizationEntity> {
    const organization = await this.prisma.organization.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
      },
    });

    return this.toOrganizationEntity(organization);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.organization.delete({ where: { id } });
  }

  async findMembership(
    userId: string,
    organizationId: string,
  ): Promise<MembershipEntity | null> {
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });

    return membership ? this.toMembershipEntity(membership) : null;
  }

  async createMembership(data: {
    userId: string;
    organizationId: string;
    role: MembershipRole;
  }): Promise<MembershipEntity> {
    const membership = await this.prisma.membership.create({
      data: {
        userId: data.userId,
        organizationId: data.organizationId,
        role: data.role,
      },
    });

    return this.toMembershipEntity(membership);
  }

  private toOrganizationEntity(organization: {
    id: string;
    name: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
  }): OrganizationEntity {
    return new OrganizationEntity(
      organization.id,
      organization.name,
      organization.slug,
      organization.createdAt,
      organization.updatedAt,
    );
  }

  private toMembershipEntity(membership: {
    id: string;
    userId: string;
    organizationId: string;
    role: MembershipRole;
    createdAt: Date;
    updatedAt: Date;
  }): MembershipEntity {
    return new MembershipEntity(
      membership.id,
      membership.userId,
      membership.organizationId,
      membership.role,
      membership.createdAt,
      membership.updatedAt,
    );
  }
}
