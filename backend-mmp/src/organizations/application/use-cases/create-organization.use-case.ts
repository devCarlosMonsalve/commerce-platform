import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { OrganizationEntity } from '../../domain/organization.entity';
import { ORGANIZATION_REPOSITORY } from '../../domain/organization.repository';
import type { IOrganizationRepository } from '../../domain/organization.repository';
import { CreateOrganizationDto } from '../dtos/create-organization.dto';

@Injectable()
export class CreateOrganizationUseCase {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY)
    private readonly organizationRepository: IOrganizationRepository,
  ) {}

  async execute(
    userId: string,
    dto: CreateOrganizationDto,
  ): Promise<OrganizationEntity> {
    const existing = await this.organizationRepository.findBySlug(dto.slug);
    if (existing) {
      throw new ConflictException('Organization slug already exists');
    }

    return this.organizationRepository.create({
      name: dto.name,
      slug: dto.slug,
      userId,
    });
  }
}
