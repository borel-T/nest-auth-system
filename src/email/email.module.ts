import { Global, Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import * as path from 'path';

@Global()
@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.mail.yahoo.fr',
        port: 465,
        secure: true,
        auth: {
          user: 'tchassemborel@yahoo.fr',
          pass: 'ywuhfpdcjdeztrxk',
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
  ],
  providers: [EmailService],
  controllers: [EmailController],
  exports: [EmailService],
})
export class EmailModule {}
