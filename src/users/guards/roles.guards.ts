import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../decorators/roles.enum';
import { Observable } from 'rxjs';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // does it have access
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(), // get metadata of the handler method in this execeution context
      context.getClass(), // get metadata of the class in this execeution context
    ]);
    // check if the current user's role, gives him access to the requested resource
    const requestObj = context.switchToHttp().getRequest(); // req-obj contains headers, payload, other metadata ...etc
    // user data depends on AUTH-GUARDS that will decode auth-token and retrieve the user and add it to request metadata
    // in case no auth-guard, then we will manually implement that logic here
    const { user } = requestObj;
    // check if user's role includes of the the required-roles to access this resource
    // case : true, continue executation pipeline | case : false , unauthorized error
    return requiredRoles.some((role) => user?.role?.includes(role));
  }
}
