import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Geass Trading Platform API')
  .setDescription(
    `
# Geass Trading Platform API

A high-performance trading platform API built with NestJS, featuring real-time market data processing, 
advanced analytics, and secure user management.

## Features

- **Authentication & Security**: JWT-based authentication with role-based access control
- **Real-time Market Data**: WebSocket-based streaming of market data with Redis pub/sub
- **TimescaleDB Integration**: Optimized time-series database for financial data storage
- **High Performance**: Redis caching and optimized database queries
- **Comprehensive Testing**: Unit, integration, and e2e tests

## Authentication

Most endpoints require authentication. Use the \`/auth/login\` endpoint to obtain a JWT token.

Include the token in the Authorization header:
\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

## Rate Limiting

API calls are rate limited to ensure fair usage and system stability.

## Error Handling

All API responses follow a consistent error format:
\`\`\`json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/endpoint"
}
\`\`\`
    `,
  )
  .setVersion('1.0.0')
  .setContact(
    'Geass Trading Platform',
    'https://github.com/your-org/geass-trading',
    'contact@geass-trading.com',
  )
  .setLicense('UNLICENSED', '')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      description: 'Enter JWT token',
      in: 'header',
    },
    'JWT-auth',
  )
  .addTag('auth', 'Authentication and authorization endpoints')
  .addTag('users', 'User management endpoints')
  .addTag('health', 'Application health check endpoints')
  .addTag('market-data', 'Market data processing endpoints')
  .addServer('http://localhost:3000', 'Development server')
  .addServer('https://api.geass-trading.com', 'Production server')
  .build();

export const swaggerOptions = {
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
  },
  customSiteTitle: 'Geass Trading Platform API Documentation',
  customfavIcon: '/favicon.ico',
  customJs: [
    'https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js',
    'https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js',
  ],
  customCssUrl: ['https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css'],
};
