import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

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

  /* Swagger */
  // config swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Auth Api Docs')
    .setDescription('Auth system documentation')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const apiDocumentation = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, apiDocumentation); // params : endpoint, app's module and documention
  /* End - Swagger */

  await app.listen(4000);
}
bootstrap();
