import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { CredentialsDto } from './dtos';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { appkeys } from 'src/config/keys';

interface TokenPayload {
  sub: number;
  email: string;
  firstName?: string;
  lastName?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private jwtService: JwtService,
  ) {}

  // 1. method that validates user credentails
  // generate tokens on valid credentials
  async logIn(credentials: CredentialsDto) {
    // get user-by-email
    const user = await this.userService.getByEmail(credentials.email);

    // if user exist and password match generate tokens
    if (user && bcrypt.compare(credentials.password, user.password)) {
      // generate tokens
      const tokens = await this.generateTokens({
        sub: user.uuid,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      });
      // save refresh-token to db
      await this.saveRefreshToken(user.uuid, tokens.refreshToken);
      // return tokens
      return tokens;
    } else {
      throw new NotFoundException();
    }
  }

  async logOut(userId: number) {
    // nullify the user's refresh token
    return this.userService.updateRefreshToken(userId, null);
  }

  // 5. implement token refresh by
  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.userService.getById(userId);
    // if user was not logged-in, (!user.refreshToken), or does not exist (!user)
    if (!user || !user.hashedRt) {
      throw new ForbiddenException('Access denied');
    } else {
      // verify refresh token match
      const refreshTokenMatches = await bcrypt.compare(
        refreshToken,
        user.hashedRt,
      );
      if (!refreshTokenMatches) {
        throw new ForbiddenException('Access denied');
      }
      const newTokens = await this.generateTokens({
        sub: user.uuid,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      });
      // save the new refresh token
      await this.saveRefreshToken(user.uuid, newTokens.refreshToken);
      // return tokens
      return newTokens;
    }
  }

  // GOOGLE OAUTH
  // if the google user already exists in database generate tokens
  // If the user doesn't exist, create a new user record and store their profile information and genertate tokens
  async googleAuth(googleUser: any) {
    // check user's existence
    const user = await this.userService.getByEmail(googleUser.email);
    if (user) {
      // generate tokens
      const tokens = await this.generateTokens({
        sub: user.uuid,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      });
      // save rrefesh-token
      this.saveRefreshToken(user.uuid, tokens.refreshToken);
      // return tokens
      return tokens;
    } else {
      const newUser = await this.userService.createGoogleUser({
        email: googleUser.email,
        firstName: googleUser.firstName,
        lastName: googleUser.lastName,
      });
      // generate tokens
      const tokens = await this.generateTokens({
        sub: newUser.uuid,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
      });
      // save rrefesh-token
      this.saveRefreshToken(user.uuid, tokens.refreshToken);
      // return tokens
      return tokens;
    }
  }

  // utils method
  private async generateTokens(payload: TokenPayload) {
    // generate tokens
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.sign(payload, {
        secret: appkeys.sign_access_token,
        expiresIn: '2m',
      }),
      this.jwtService.sign(payload, {
        secret: appkeys.sign_refresh_token,
        expiresIn: '15m',
      }),
    ]);
    //
    return {
      accessToken,
      refreshToken,
    };
  }

  private async saveRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userService.updateRefreshToken(userId, hashedRefreshToken);
  }
}
