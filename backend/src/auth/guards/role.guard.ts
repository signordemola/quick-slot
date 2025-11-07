import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { Observable } from 'rxjs';
import { RequestWithUser } from 'src/types';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRole = this.reflector.getAllAndOverride<UserRole>('role', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRole) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<RequestWithUser>();

    console.log('🛡 Required role:', requiredRole);
    console.log('🧑‍💻 User role:', user.role);

    return user && user.role === requiredRole;
  }
}
