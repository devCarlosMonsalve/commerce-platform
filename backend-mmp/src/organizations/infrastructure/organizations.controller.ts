import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { MembershipRole } from '@prisma/client';
import type { JwtPayload } from '../../shared/types/jwt-payload';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { OrganizationMemberGuard } from '../../shared/guards/organization-member.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { ok } from '../../shared/response/api-response';
import { CreateOrganizationDto } from '../application/dtos/create-organization.dto';
import { OrganizationResponse } from '../application/dtos/organization.response';
import { UpdateOrganizationDto } from '../application/dtos/update-organization.dto';
import { CreateOrganizationUseCase } from '../application/use-cases/create-organization.use-case';
import { DeleteOrganizationUseCase } from '../application/use-cases/delete-organization.use-case';
import { GetOrganizationUseCase } from '../application/use-cases/get-organization.use-case';
import { ListOrganizationsUseCase } from '../application/use-cases/list-organizations.use-case';
import { UpdateOrganizationUseCase } from '../application/use-cases/update-organization.use-case';

@Controller('organizations')
export class OrganizationsController {
  constructor(
    private readonly createOrganizationUseCase: CreateOrganizationUseCase,
    private readonly listOrganizationsUseCase: ListOrganizationsUseCase,
    private readonly getOrganizationUseCase: GetOrganizationUseCase,
    private readonly updateOrganizationUseCase: UpdateOrganizationUseCase,
    private readonly deleteOrganizationUseCase: DeleteOrganizationUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateOrganizationDto) {
    const organization = await this.createOrganizationUseCase.execute(user.sub, dto);
    return ok(OrganizationResponse.from(organization), 'Organization created successfully');
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async list(@CurrentUser() user: JwtPayload) {
    const organizations = await this.listOrganizationsUseCase.execute(user.sub);
    return ok(organizations.map(OrganizationResponse.from));
  }

  @Get(':orgId')
  @UseGuards(JwtAuthGuard, OrganizationMemberGuard)
  async get(@Param('orgId') orgId: string) {
    const organization = await this.getOrganizationUseCase.execute(orgId);
    return ok(OrganizationResponse.from(organization));
  }

  @Patch(':orgId')
  @Roles(MembershipRole.OWNER, MembershipRole.ADMIN)
  @UseGuards(JwtAuthGuard, OrganizationMemberGuard, RolesGuard)
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('orgId') orgId: string,
    @Body() dto: UpdateOrganizationDto,
  ) {
    const organization = await this.updateOrganizationUseCase.execute(user.sub, orgId, dto);
    return ok(OrganizationResponse.from(organization), 'Organization updated successfully');
  }

  @Delete(':orgId')
  @Roles(MembershipRole.OWNER)
  @UseGuards(JwtAuthGuard, OrganizationMemberGuard, RolesGuard)
  async remove(@CurrentUser() user: JwtPayload, @Param('orgId') orgId: string) {
    await this.deleteOrganizationUseCase.execute(user.sub, orgId);
    return ok(null, 'Deleted successfully');
  }
}

