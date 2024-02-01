import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import { appkeys } from 'src/config/keys';

// 2. Define Passort-strategy that will be used to verify tokens in header
// this verification takes place for every call on protected routes
// init strategy with token options
@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // ignoreExpiration: false,
      secretOrKey: appkeys.sign_refresh_token,
      // pass http request object, to the validate-callback method
      passReqToCallback: true,
    });
  }

  //   For the jwt-strategy, Passport first verifies the JWT's signature and decodes the JSON.
  //   It then invokes our validate() method passing the decoded JSON as its single parameter.
  //   passport passes over the jwt-payload to validate method
  async validate(req: Request, payload: any) {
    // if required extra payload manipulation can be done here
    const refreshToken = req.get('Authorization').replace('Bearer', ' ').trim();
    return { ...payload, refreshToken };
  }
}
