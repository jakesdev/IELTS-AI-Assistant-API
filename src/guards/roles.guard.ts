import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import type { UserRole } from '../constants';
import type { Users } from '../modules/users/schema';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const roles = this.reflector.get<UserRole>('roles', context.getHandler());
        const request = context.switchToHttp().getRequest();
        const user = <Users>request.user;

        return roles.includes(user.role);
    }
}
