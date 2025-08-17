import { ApiProperty } from '@nestjs/swagger';

export class HealthCheckDto {
  @ApiProperty({
    description: 'Health status of the dependency',
    enum: ['up', 'down'],
    example: 'up',
  })
  public status: 'up' | 'down';

  @ApiProperty({
    description: 'Response time in milliseconds',
    example: 25,
  })
  public responseTime: number;

  @ApiProperty({
    description: 'Additional details about the health check',
    example: 'Connected successfully',
    required: false,
  })
  public details?: string;
}

export class HealthResponseDto {
  @ApiProperty({
    description: 'Overall application status',
    enum: ['ok', 'error'],
    example: 'ok',
  })
  public status: 'ok' | 'error';

  @ApiProperty({
    description: 'Timestamp when health check was performed',
    example: '2024-01-01T00:00:00.000Z',
  })
  public timestamp: string;

  @ApiProperty({
    description: 'Application uptime in seconds',
    example: 3600,
  })
  public uptime: number;

  @ApiProperty({
    description: 'Memory usage information',
    example: {
      used: 45.6,
      total: 512,
      percentage: 8.9,
    },
  })
  public memory: {
    used: number;
    total: number;
    percentage: number;
  };

  @ApiProperty({
    description: 'Health status of individual dependencies',
    type: () => Object,
    example: {
      database: {
        status: 'up',
        responseTime: 25,
        details: 'Connected successfully',
      },
      redis: {
        status: 'up',
        responseTime: 12,
        details: 'Connected successfully',
      },
    },
  })
  public checks: Record<string, HealthCheckDto>;

  @ApiProperty({
    description: 'Application version',
    example: '1.0.0',
  })
  public version: string;

  @ApiProperty({
    description: 'Environment',
    example: 'development',
  })
  public environment: string;
}
