import { Body, Post, Controller } from '@nestjs/common';

@Controller('email')
export class EmailController {
  constructor() {}

  @Post('/send-text')
  sendTextMail(@Body() body: any) {
    return null;
  }
}
