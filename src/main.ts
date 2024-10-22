import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  VERSION_NEUTRAL,
  VersioningType,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: VERSION_NEUTRAL,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true, // Automatically transforms payloads to be objects typed according to their DTO classes
      transformOptions: {
        enableImplicitConversion: true,
      },
      validationError: {
        target: false,
        value: false,
      },
      exceptionFactory: (errors) => {
        // Customize the error response format
        const messages = errors.map(
          (error) =>
            `${error.property} - ${Object.values(error.constraints).join(
              ', ',
            )}`,
        );
        return new BadRequestException(messages);
      },
    }),
  );

  // Configure Swagger
  const config = new DocumentBuilder()
    .setTitle('UBI Beneficiary API')
    .setDescription('API documentation for UBI Beneficiary')
    .setVersion('1.0')
    .addServer('/api')
    .addApiKey(
      { type: 'apiKey', name: 'Authorization', in: 'header' },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/docs', app, document); // Route for Swagger UI

  await app.listen(process.env.PORT);
}
bootstrap();
