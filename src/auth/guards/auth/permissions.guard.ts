import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PERMISSIONS_KEY } from '../../decorators/permissions.decorator';
import { PrismaService } from 'src/prisma/prisma.service';

interface RequestWithUser extends Request {
  user?: {
    sub: string;
    username: string;
  };
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('The user could not be verified.');
    }

    const userRoleMappings = await this.prisma.userRoleMapping.findMany({
      where: { userId: user.sub },
      include: {
        role: {
          include: { permissions: true },
        },
      },
    });

    const userPermissions = userRoleMappings.flatMap((mapping) =>
      mapping.role.permissions.map((rp) => rp.permissionKey),
    );

    const hasPermission = requiredPermissions.every((reqPerm) =>
      userPermissions.includes(reqPerm),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have the necessary permission to perform this action.',
      );
    }

    return true;
  }
}
