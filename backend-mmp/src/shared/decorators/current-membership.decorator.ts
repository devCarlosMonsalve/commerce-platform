import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Membership } from '@prisma/client';

export const CurrentMembership = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Membership => {
    return ctx.switchToHttp().getRequest().membership;
  },
);
