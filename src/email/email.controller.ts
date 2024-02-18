import { Body, Post, Controller } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('/send-text')
  sendTextMail(@Body() body: any) {
    console.log('body', body);
    this.emailService.sendWelcomeEmail(body);
  }
}
