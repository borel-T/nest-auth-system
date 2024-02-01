import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth2';
import { appkeys } from 'src/config/keys';

@Injectable()
export class GoogleOathStrategy extends PassportStrategy(
  Strategy,
  'google-oauth',
) {
  constructor() {
    super({
      clientID: appkeys.google_client_id,
      clientSecret: appkeys.google_client_secret,
      callbackURL: 'http://localhost:4000/auth/google/callback',
      scope: ['profile'],
    });
  }

  async validate(
    access_token: string,
    refresh_token: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, email, given_name, family_name, photos } = profile;

    const googleUserinfo = {
      provider: 'google',
      providerId: id,
      email: email,
      firstName: given_name,
      lastName: family_name,
      picture: photos[0].value,
    };

    done(null, googleUserinfo);
  }
}
