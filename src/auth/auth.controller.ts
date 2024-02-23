import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Post } from '@nestjs/common';
import { CredentialsDto } from './dtos';
import { CreateUserDto } from 'src/users/dtos/createUser.dtos';
import { PublicRoute } from 'src/commons/decorators';
import { Request } from 'express';
import { JwtAuthGuard } from './guards/jwt.guard';
import { RefreshTokenGuard } from './guards/refreshToken.guard';
import { GoogleOauthGuard } from './guards/google-oauth.guard';
import { updatePasswordDto } from './dtos/updatePassword.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @PublicRoute()
  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  logIn(@Body() credentials: CredentialsDto, @Req() req: Request) {
    return this.authService.logIn(credentials);
  }

  @UseGuards(RefreshTokenGuard) // middle-ware will attach 'user' object to requet obj
  @Get('refresh')
  async refreshToken(@Req() req) {
    const user = req.user;
    return await this.authService.refreshTokens(
      req.user.sub,
      req.user.refreshToken,
    );
  }

  @Post('verify-account')
  async verifyAccount(@Query('token') token: string) {
    return this.authService.verifyUserEmail(token);
  }

  @UseGuards(JwtAuthGuard)
  @Get('logout')
  async logout(@Req() req) {
    // given user is logged-in, userId can be gotten from accessToken in req
    return await this.authService.logOut(req.user.sub);
  }

  /******************/
  /*  GOOGLE AUTH   */
  /******************/

  @Get('google')
  @UseGuards(GoogleOauthGuard) // passport understand and redirect to google's access-grant
  async googleOauth2() {}

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard) // once google-user grants access, this method will handle callback
  async googleOauthCallback(@Req() req) {
    // retrieve user from DB or create user is he does not exist
    // generate and return access and refresh tokens
    return this.authService.googleAuth(req.user);
  }

  /******************/
  /* PASSWORD RESET */
  /******************/

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    try {
      await this.authService.forgotPassword(body.email);
      return 'email-sent';
    } catch (error) {
      console.log('Error password recover email not sent ::::');
      return 'error-occured';
    }
  }

  @Post('reset-password')
  async resetPassword(@Body() body: updatePasswordDto) {
    try {
      await this.authService.resetPassword(body.token, body.password);
      return 'passwrod reset success';
    } catch (error) {
      console.log('Password update error ::::', error);
      return 'error-occured';
    }
  }
}
