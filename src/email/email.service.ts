import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ACCOUNT_ACTIVATED,
  ACCOUNT_CREATED,
  ACCOUNT_PASSWORD_FORGOTTEN,
  ACCOUNT_PASSWORD_UPDATED,
} from 'src/commons/events/userEvents';

interface EmailDto {
  receiver: string;
  subject: string;
  text?: string;
  html?: string;
  template?: string;
  context?: object;
}

interface EmailTokenDto {
  receiverEmail: string;
  receiverName: string;
  link?: string;
}

const SENDER = 'tchassemborel@yahoo.fr';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  // sends welcome email
  @OnEvent(ACCOUNT_CREATED, { async: true })
  sendWelcomeEmail(payload: EmailTokenDto) {
    let options = {
      receiver: payload.receiverEmail,
      subject: 'Account Created !',
      template: 'welcome',
      context: { user_name: payload.receiverName },
    };
    return this.sendEmail(options);
  }

  // sends email to verify user's account
  @OnEvent(ACCOUNT_CREATED, { async: true })
  sendAccountVerificationEmail(payload: EmailTokenDto) {
    let options = {
      receiver: payload.receiverEmail,
      subject: 'Email verification',
      template: 'email-verification',
      context: {
        user_name: payload.receiverName,
        confirmation_url: payload.link,
      },
    };
    return this.sendEmail(options);
  }

  // sends email on user's account activation success
  @OnEvent(ACCOUNT_ACTIVATED, { async: true })
  sendAcccountActivatedEmail(data: EmailTokenDto) {
    let options = {
      receiver: data.receiverEmail,
      subject: 'Account activated !',
      template: 'account-activated',
      context: {
        user_name: data.receiverName,
        login_url: data.link,
      },
    };
    return this.sendEmail(options);
  }

  // sends password reset link to user
  @OnEvent(ACCOUNT_PASSWORD_FORGOTTEN, { async: true })
  sendResetPasswordEmail(data: EmailTokenDto) {
    let options = {
      receiver: data.receiverEmail,
      subject: 'Retreive Your Password',
      template: 'forgot-password',
      context: {
        user_name: data.receiverName,
        reset_url: data.link,
      },
    };
    return this.sendEmail(options);
  }

  // send password update success email
  @OnEvent(ACCOUNT_PASSWORD_UPDATED, { async: true })
  sendPasswordUpdatedEmail(data: EmailTokenDto) {
    let options = {
      receiver: data.receiverEmail,
      subject: 'Password updated !',
      template: 'reset-password-success',
      context: { user_name: data.receiverName, login_url: data.link },
    };
    return this.sendEmail(options);
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
      console.log(mailData.subject + 'email sent.');
    } catch (error) {
      console.log(mailData.subject + 'email not sent. Error Details ::', error);
      return false;
    }
  }
}
