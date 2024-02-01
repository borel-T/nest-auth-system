import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Post } from '@nestjs/common';
import { CredentialsDto } from './dtos';
import { CreateUserDto } from 'src/users/dtos/createUser.dtos';
import { UsersService } from 'src/users/users.service';
import { PublicRoute } from 'src/commons/decorators';
import { Request } from 'express';
import { JwtAuthGuard } from './guards/jwt.guard';
import { RefreshTokenGuard } from './guards/refreshToken.guard';
import { GoogleOathStrategy } from './strategies/google-oauth.stratety';
import { GoogleOauthGuard } from './guards/google-oauth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @PublicRoute()
  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
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

  @UseGuards(JwtAuthGuard)
  @Get('test')
  async crat(@Req() req) {
    return await req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('logout')
  async logout(@Req() req) {
    // given user is logged-in, userId can be gotten from accessToken in req
    return await this.authService.logOut(req.user.sub);
  }

  // GOOGLE AUTG

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
}
