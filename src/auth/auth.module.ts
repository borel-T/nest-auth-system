import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { GoogleOathStrategy } from './strategies/google-oauth.stratety';
import { EmailService } from 'src/email/email.service';

@Module({
  imports: [UsersModule, PassportModule, JwtModule.register({ global: true })],
  // provides full user module's and sub module
  providers: [
    AuthService,
    JwtService, // will be used to sign tokens
    EmailService, // email sender service
    // auth-strategies
    AccessTokenStrategy, // provide the defined jwt-strategy, so it can be injected and used by passport-auth-guard
    RefreshTokenStrategy,
    GoogleOathStrategy,
    // {
    //   provide: APP_GUARD, // make Guard global
    //   useClass: JwtAuthGuard, // provide jwtAuthGuard to be used default & globally
    // },
  ],
  controllers: [AuthController],
})
export class AuthModule {}
