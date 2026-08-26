import { Module } from '@nestjs/common';
import { CreateOrganizationUseCase } from './application/use-cases/create-organization.use-case';
import { DeleteOrganizationUseCase } from './application/use-cases/delete-organization.use-case';
import { GetOrganizationUseCase } from './application/use-cases/get-organization.use-case';
import { ListOrganizationsUseCase } from './application/use-cases/list-organizations.use-case';
import { UpdateOrganizationUseCase } from './application/use-cases/update-organization.use-case';
import { ORGANIZATION_REPOSITORY } from './domain/organization.repository';
import { OrganizationsController } from './infrastructure/organizations.controller';
import { PrismaOrganizationRepository } from './infrastructure/persistence/prisma-organization.repository';
import { OrganizationMemberGuard } from '../shared/guards/organization-member.guard';
import { RolesGuard } from '../shared/guards/roles.guard';

@Module({
  controllers: [OrganizationsController],
  providers: [
    CreateOrganizationUseCase,
    ListOrganizationsUseCase,
    GetOrganizationUseCase,
    UpdateOrganizationUseCase,
    DeleteOrganizationUseCase,
    OrganizationMemberGuard,
    RolesGuard,
    { provide: ORGANIZATION_REPOSITORY, useClass: PrismaOrganizationRepository },
  ],
})
export class OrganizationsModule {}
