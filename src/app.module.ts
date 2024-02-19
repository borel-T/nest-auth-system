import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { EmailModule } from './email/email.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    PrismaModule,
    EmailModule,
    EventEmitterModule.forRoot(), //initializes the event emitter and registers any declarative event listeners that exist within your app
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
