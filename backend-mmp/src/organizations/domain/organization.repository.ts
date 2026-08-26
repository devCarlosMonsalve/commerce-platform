import { MembershipRole } from '@prisma/client';
import { MembershipEntity } from './membership.entity';
import { OrganizationEntity } from './organization.entity';

export const ORGANIZATION_REPOSITORY = 'ORGANIZATION_REPOSITORY';

export interface IOrganizationRepository {
  findById(id: string): Promise<OrganizationEntity | null>;
  findBySlug(slug: string): Promise<OrganizationEntity | null>;
  findAllByUserId(userId: string): Promise<OrganizationEntity[]>;
  create(data: {
    name: string;
    slug: string;
    userId: string;
  }): Promise<OrganizationEntity>;
  update(id: string, data: {
    name?: string;
    slug?: string;
  }): Promise<OrganizationEntity>;
  delete(id: string): Promise<void>;
  findMembership(
    userId: string,
    organizationId: string,
  ): Promise<MembershipEntity | null>;
  createMembership(data: {
    userId: string;
    organizationId: string;
    role: MembershipRole;
  }): Promise<MembershipEntity>;
}
