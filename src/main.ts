import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { swaggerConfig } from './config/swagger.config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global prefix for API routes
  app.setGlobalPrefix('api', {
    exclude: ['health', 'docs'],
  });

  // CORS configuration
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? ['https://geass-trading.com', 'https://app.geass-trading.com']
        : true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Swagger configuration
  const document = SwaggerModule.createDocument(app, swaggerConfig);

  // Traditional Swagger UI (available at /docs)
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
    },
    customSiteTitle: 'Geass Trading Platform API Documentation',
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info { margin: 20px 0; }
      .swagger-ui .info .title { color: #3b4151; }
    `,
    jsonDocumentUrl: '/docs-json',
  });

  // Scalar API Reference (available at /reference)
  const { apiReference } = await import('@scalar/nestjs-api-reference');

  app.use(
    '/reference',
    apiReference({
      theme: 'alternate',
      metaData: {
        title: 'Geass Trading Platform API Reference',
        description: 'Interactive API documentation powered by Scalar',
      },
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  const logger = new Logger('Bootstrap');

  if (process.env.NODE_ENV !== 'production') {
    logger.log(`🚀 Application running on: http://localhost:${port}`);
    logger.log(`📚 Swagger UI available at: http://localhost:${port}/docs`);
    logger.log(`📖 Scalar API Reference available at: http://localhost:${port}/reference`);
    logger.log(`❤️  Health check available at: http://localhost:${port}/health`);
  }
}

void bootstrap();
