import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

interface EmailDto {
  receiver: string;
  subject?: string;
  text?: string;
  html?: string;
  template?: string;
  context?: object;
}

interface EmailTokenDto {
  receiver: string;
  userName: string;
  link: string;
}

const SENDER = 'tchassemborel@yahoo.fr';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  sendWelcomeEmail(emailInfo: EmailDto) {
    let options = {
      ...emailInfo,
      template: 'welcome',
      context: { userName: 'Joelito' },
    };
    this.sendEmail(options);
  }

  sendVerficationEmail(data: EmailTokenDto) {
    let options = {
      receiver: data.receiver,
      subject: 'Email Verification',
      template: 'email-verification',
      context: {
        user_name: data.userName,
        confirmation_url: data.link,
      },
    };
    this.sendEmail(options);
  }

  sendResetPasswordEmail(data: EmailTokenDto) {
    let options = {
      receiver: data.receiver,
      subject: 'Retreive Your Password',
      template: 'forgot-password',
      context: {
        user_name: data.userName,
        reset_url: data.link,
      },
    };
    this.sendEmail(options);
  }

  /* Mail util */
  async sendEmail(mailData: EmailDto) {
    try {
      let options = {
        from: SENDER,
        to: mailData.receiver,
        subject: mailData.subject,
        ...(mailData.text && { text: mailData.text }),
        ...(mailData.html && { html: mailData.html }),
        // Use the template engine file and context
        ...(mailData.template && { template: mailData.template }),
        ...(mailData.context && { context: mailData.context }),
      };
      await this.mailerService.sendMail(options);
      console.log('email gone...........');
    } catch (error) {
      console.log('email-error', error);
      throw new InternalServerErrorException();
    }
  }
}
