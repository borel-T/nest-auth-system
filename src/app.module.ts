import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { EmailModule } from './email/email.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { redisStore } from 'cache-manager-redis-yet';

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

    /* APP CONGFIG SETUP */
    ConfigModule.forRoot({
      isGlobal: true,
      // envFilePath: '.development.env', // by default it picks .env if you have other file like dev.env specify it here
      // envFilePath: ['.env.development.local', '.env.development']  //
    }), // using nestjs config-module

    /* IN MERMORY CACHING SETUP */
    CacheModule.register({
      isGlobal: true,
    }),

    /* REDIS CACHING SETUP */
    // CacheModule.registerAsync({
    //   inject: [ConfigService],
    //   useFactory: async (configService: ConfigService) => ({
    //     isGlobal: true,
    //     store: await redisStore({
    //       url: configService.get('REDIS_URI'),
    //       ttl: 5000,
    //     }),
    //   }),
    // }),
  ],
  controllers: [],
  providers: [
    // TO AUTO CACHE GlOBALLY, provide to "APP_INTERCEPTOR" a "cacheInterceptor" class
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: CacheInterceptor,
    // },
  ],
})
export class AppModule {}
