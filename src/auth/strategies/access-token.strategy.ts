import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { appkeys } from 'src/config/keys';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      // supplies the method by which the JWT will be extracted from the Request
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // we choose the default false setting, which delegates the responsibility of ensuring
      // that a JWT has not expired to the Passport module. Passport will return 401 if expired
      // -----------> ignoreExpiration: false,
      // verification key = sign key
      secretOrKey: appkeys.sign_access_token,
    });
  }

  // Implementing a validate() method in your subclass.
  // The validate() is a callback method call to verify user's credentials
  // Passport first verifies the JWT's signature and decodes the JSON.
  // It then invokes our validate() method passing the decoded JSON as its single
  // parameter. Based on the way JWT signing works, we're guaranteed that we're
  //  receiving a valid token that we have previously signed and issued to a valid user.
  // --> Passport will build a user object based on the return value of our validate() method,
  // and attach it as a property on the Request object.
  async validate(payload: any) {
    return payload;
  }
}
