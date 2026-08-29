import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { MembershipRole } from '@prisma/client';
import { Roles } from '../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { OrganizationMemberGuard } from '../../shared/guards/organization-member.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { ok } from '../../shared/response/api-response';
import {
  GenerateOperationsSummaryUseCase,
  isOperationsSummarySection,
} from '../application/use-cases/generate-operations-summary.use-case';
import { SearchOperationsUseCase } from '../application/use-cases/search-operations.use-case';
import { VerifyAiConnectorsUseCase } from '../application/use-cases/verify-ai-connectors.use-case';
import { OperationalSearchDto } from '../application/dtos/operational-search.dto';
import { GeneratePurchaseSuggestionsUseCase } from '../application/use-cases/generate-purchase-suggestions.use-case';

@Controller('organizations/:orgId/ai')
export class AiController {
  constructor(
    private readonly verifyAiConnectorsUseCase: VerifyAiConnectorsUseCase,
    private readonly generateOperationsSummaryUseCase: GenerateOperationsSummaryUseCase,
    private readonly searchOperationsUseCase: SearchOperationsUseCase,
    private readonly generatePurchaseSuggestionsUseCase: GeneratePurchaseSuggestionsUseCase,
  ) {}

  @Get('connectors/verify')
  @Roles(MembershipRole.OWNER, MembershipRole.ADMIN)
  @UseGuards(JwtAuthGuard, OrganizationMemberGuard, RolesGuard)
  async verifyConnectors() {
    const connectors = await this.verifyAiConnectorsUseCase.execute();
    return ok(connectors, 'AI connectors verified successfully');
  }

  @Get('operations-summary')
  @Roles(MembershipRole.OWNER, MembershipRole.ADMIN)
  @UseGuards(JwtAuthGuard, OrganizationMemberGuard, RolesGuard)
  async generateOperationsSummary(
    @Param('orgId') organizationId: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    const summary = await this.generateOperationsSummaryUseCase.execute(
      organizationId,
      acceptLanguage ?? 'es',
    );
    return ok(summary, 'Operations summary generated successfully');
  }

  @Get('operations-summary/:section')
  @Roles(MembershipRole.OWNER, MembershipRole.ADMIN)
  @UseGuards(JwtAuthGuard, OrganizationMemberGuard, RolesGuard)
  async generateSectionSummary(
    @Param('orgId') organizationId: string,
    @Param('section') section: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    if (!isOperationsSummarySection(section)) {
      throw new BadRequestException('Unsupported operations summary section');
    }

    const summary = await this.generateOperationsSummaryUseCase.execute(
      organizationId,
      acceptLanguage ?? 'es',
      section,
    );
    return ok(summary, 'Section summary generated successfully');
  }

  @Post('operations/search')
  @Roles(MembershipRole.OWNER, MembershipRole.ADMIN)
  @UseGuards(JwtAuthGuard, OrganizationMemberGuard, RolesGuard)
  async searchOperations(
    @Param('orgId') organizationId: string,
    @Body() dto: OperationalSearchDto,
  ) {
    const result = await this.searchOperationsUseCase.execute(
      organizationId,
      dto.query,
    );
    return ok(result, 'Operational search completed successfully');
  }

  @Get('purchase-suggestions')
  @Roles(MembershipRole.OWNER, MembershipRole.ADMIN)
  @UseGuards(JwtAuthGuard, OrganizationMemberGuard, RolesGuard)
  async generatePurchaseSuggestions(
    @Param('orgId') organizationId: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    const suggestions = await this.generatePurchaseSuggestionsUseCase.execute(
      organizationId,
      acceptLanguage ?? 'es',
    );
    return ok(suggestions, 'Purchase suggestions generated successfully');
  }
}
