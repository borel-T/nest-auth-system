import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { EmailModule } from './email/email.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule } from '@nestjs/config';

/* app.module.ts 
   imports all modules of our application
   app.module.ts is used in NestFactory(app.mnodule) 
   to create an instance of the application
*/

@Module({
  imports: [
    UsersModule,
    AuthModule,
    PrismaModule,
    EmailModule, // @Global() module : it's providers can be injected without importing them in other modules
    EventEmitterModule.forRoot(), // initializes the event emitter and registers any declarative event listeners that exist within your
    // app-env-config-module
    ConfigModule.forRoot({
      isGlobal: true,
      // envFilePath: '.development.env', // by default it picks .env if you have other file like dev.env specify it here
      // envFilePath: ['.env.development.local', '.env.development']  //
    }), // using nestjs config-module
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
