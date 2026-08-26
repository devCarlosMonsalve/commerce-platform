import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MembershipRole } from '@prisma/client';
import { OrganizationEntity } from '../../domain/organization.entity';
import { ORGANIZATION_REPOSITORY } from '../../domain/organization.repository';
import type { IOrganizationRepository } from '../../domain/organization.repository';
import { UpdateOrganizationDto } from '../dtos/update-organization.dto';

@Injectable()
export class UpdateOrganizationUseCase {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY)
    private readonly organizationRepository: IOrganizationRepository,
  ) {}

  async execute(
    userId: string,
    organizationId: string,
    dto: UpdateOrganizationDto,
  ): Promise<OrganizationEntity> {
    const organization = await this.organizationRepository.findById(organizationId);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const membership = await this.organizationRepository.findMembership(
      userId,
      organizationId,
    );
    if (!membership) {
      throw new ForbiddenException('Access denied');
    }

    if (membership.role === MembershipRole.MEMBER) {
      throw new ForbiddenException('Insufficient permissions');
    }

    if (dto.slug && dto.slug !== organization.slug) {
      const existing = await this.organizationRepository.findBySlug(dto.slug);
      if (existing) {
        throw new ConflictException('Organization slug already exists');
      }
    }

    return this.organizationRepository.update(organizationId, {
      name: dto.name,
      slug: dto.slug,
    });
  }
}
