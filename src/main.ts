import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // create app
  const app = await NestFactory.create(AppModule);

  // binding validation-pipe
  // validation-pipe makes use of class-validator and class-transformer librairies
  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: false, // don't show detailed errors
      //  whitelist: false, // props not include in whitelist won't be passed over in req. obj
      // transform: true,  // auto transform types to the declared controllers types
    }),
  );

  await app.listen(4000);
}
bootstrap();
