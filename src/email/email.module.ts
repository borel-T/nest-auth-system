import { Global, Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    // It's possible to initialize mailer.module using forRoot() and static options
    // for this case we are using dynamic options so we use forRootAsync()
    MailerModule.forRootAsync({
      // generally the module of the injected service needs to be imported
      // but this module was imported and made global in the app.module.ts
      // so no need to add this -----> imports: [ConfigModule],
      // inject the config service to be used in use-factory to dynamically initialise this module
      inject: [ConfigService],
      // use-factory is used associated to forRootAsyn to dynamically initialise a module
      // use-factory should be an async method that returns an object of dynamic options
      // is this case it makes use of the injecte 'ConfigService' to get the dynamic options values
      // use-class could also be used for the same purpose
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('SMTP_HOST'),
          port: configService.get<number>('SMTP_PORT'),
          secure: configService.get<boolean>('SMTP_SECURE'),
          auth: {
            user: configService.get<string>('SMTP_USER'),
            pass: configService.get<string>('SMTP_PASS'),
          },
        },
        defaults: {
          from: ' From Name <komek.pro> ',
        },
        template: {
          dir: path.join(__dirname, '/templates'),
          adapter: new EjsAdapter(),
          options: { strict: false },
        },
      }),
    }),
  ],
  providers: [EmailService],
  controllers: [EmailController],
  exports: [EmailService],
})
export class EmailModule {}
