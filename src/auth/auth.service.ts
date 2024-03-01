import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { CredentialsDto } from './dtos';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { appkeys } from 'src/config/keys';
import { CreateUserDto } from 'src/users/dtos/createUser.dtos';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EmailService } from 'src/email/email.service';
import {
  ACCOUNT_PASSWORD_FORGOTTEN,
  ACCOUNT_PASSWORD_UPDATED,
} from 'src/commons/events/userEvents';

interface TokenPayload {
  sub: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: String;
}

const myUser = {
  id: 23,
  email: 'borel@gmail.com',
  firstName: 'borel',
  password: 'password04',
};

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private jwtService: JwtService,
    private readonly emailService: EmailService,
    private eventEmitter: EventEmitter2,
  ) {}

  async signup(userData: CreateUserDto) {
    let user = null;
    try {
      user = await this.userService.create(userData);
    } catch (error) {
      throw new ConflictException('User conflict');
    }
    if (user) {
      // create acccount verification token
      let token = this.jwtService.sign(
        { email: user.email },
        { secret: 'email_verification', expiresIn: '48h' },
      );
      // create verification link
      let verificationLink = `http://localhost:4000/auth/verify-account?token=${token}`;
      // send welcome email
      this.eventEmitter.emit('account.created', {
        receiverEmail: user.email,
        receiverName: user.firstName,
        link: verificationLink,
      });
    }
  }

  // 1. method that validates user credentails
  // generate tokens on valid credentials
  async logIn(credentials: CredentialsDto) {
    // get user-by-email
    const user = await this.userService.getByEmail(credentials.email);
    if (!user) {
      throw new NotFoundException();
    }
    // if user exist and passwords match generate tokens
    let passwordsMatch = await bcrypt.compare(
      credentials.password,
      user.password,
    );
    if (!passwordsMatch) {
      throw new BadRequestException();
    }
    // generate tokens
    const tokens = await this.generateTokens({
      sub: user.uuid,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    });
    // save refresh-token to db
    await this.saveRefreshToken(user.uuid, tokens.refreshToken);
    // return tokens
    return tokens;
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

  async verifyUserEmail(token: string) {
    try {
      // verify token validity
      this.jwtService.verify(token, {
        secret: 'email_verification',
      });
    } catch (error) {
      throw new BadRequestException('Invalid or Expired Token');
    }
    // check user's existence in DB
    let decodedUser = this.jwtService.decode(token);
    // get acutual user
    let actualUser = await this.userService.getByEmail(decodedUser.email);
    if (!actualUser) {
      throw new BadRequestException('User not found');
    }
    // update user email-verified field
    this.userService.update(actualUser.uuid, { emailVerified: true });
  }

  async forgotPassword(email: string) {
    // check user's existence
    let user = await this.userService.getByEmail(email);
    if (!user) {
      throw new NotFoundException();
    }
    // now generate reset-password link
    let data = { sub: user.uuid, email: user.email };
    let token = this.jwtService.sign(data, {
      secret: 'mysecret',
      expiresIn: '48h',
    });
    // create recovering link
    const recoverPasswordLink = `http://localhost:4000/auth/password-reset?token=${token}`;
    // Email Service send reset link by
    this.eventEmitter.emit(ACCOUNT_PASSWORD_FORGOTTEN, {
      receiverEmail: user.email,
      receiverName: user.firstName,
      link: recoverPasswordLink,
    });
  }

  async resetPassword(token: any, newPassword: string) {
    try {
      // verify token validity
      this.jwtService.verify(token, {
        secret: 'mysecret',
      });
    } catch (error) {
      throw new BadRequestException();
    }
    // decode token
    let decodedUser = this.jwtService.decode(token);
    // confirm user's existence
    let userExist = await this.userService.getByEmail(decodedUser.email);
    if (!userExist) {
      throw new UnauthorizedException();
    }
    // save user's new password (user-service will hash the password )
    await this.userService.updatePassword(userExist.uuid, newPassword);
    // send success email
    this.eventEmitter.emit(ACCOUNT_PASSWORD_UPDATED, {
      receiverName: userExist.firstName,
      receiverEmail: userExist.email,
      link: 'http://localhost:4000/login',
    });
  }

  /********************
   * utils methods    */
  /********************/

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
