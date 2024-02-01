import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from 'src/commons/decorators';

// 3. Create jwt guard decorator
// this guard extends passport-auth-guard class
// it act as middle-ware and uses the correspoding passport-strategy defined in (2)
// to verify if tokens and pas over token.payload to route-handlers

// When protected route is hit, Guard will automatically invoke our passport-jwt custom configured strategy,
// validate the JWT, and assign the user property to the Request object.

// Note: to override canActivate method from parent we need to implement it

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // 4. Lastly, we need the JwtAuthGuard to return true when the "isPublic" metadata is found
  constructor(private reflector: Reflector) {
    super();
  }

  // implement canActivate using reflector to determine public route
  canActivate(context: ExecutionContext) {
    // Before our parent guard, verifues tokens
    // Retrieve metadata for a specified key for a specified set of targets and return a first not undefined value.
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(), // Returns a reference to the handler (method) that will be invoked next in the request pipeline.
      context.getClass(), // Returns the type of the controller class which the current handler belongs to.
    ]);

    if (isPublic) {
      // true : means continue to the next handler in pipeline
      // this will jump the need for Auth-Guard token verification and move to next ie: route-handler
      return true;
    }

    // return context to Parent's class canActivate Method, for it to continue other checks of the guard
    return super.canActivate(context);
  }
}
