import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtUser, RequestWithUser } from 'src/types';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtUser => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);
