import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { HealthResponseDto } from './dto/health-response.dto';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({
    summary: 'Health check endpoint',
    description: `
      Performs a comprehensive health check of the application and its dependencies.
      
      This endpoint checks:
      - Application status
      - Database connectivity
      - Redis connectivity
      - Memory usage
      - Uptime information
      
      Returns detailed health status with timestamps and metrics.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Application and all dependencies are healthy',
    type: HealthResponseDto,
  })
  @ApiResponse({
    status: 503,
    description: 'Application or dependencies are unhealthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'error' },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        checks: {
          type: 'object',
          properties: {
            database: { type: 'string', example: 'down' },
            redis: { type: 'string', example: 'down' },
          },
        },
        error: { type: 'string', example: 'Database connection failed' },
      },
    },
  })
  public async check(): Promise<HealthResponseDto> {
    return await this.healthService.check();
  }

  @Get('live')
  @ApiOperation({
    summary: 'Liveness probe',
    description: 'Simple liveness check for Kubernetes/Docker health monitoring',
  })
  @ApiResponse({
    status: 200,
    description: 'Application is alive',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
      },
    },
  })
  public live(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  @ApiOperation({
    summary: 'Readiness probe',
    description: 'Readiness check that verifies application is ready to serve traffic',
  })
  @ApiResponse({
    status: 200,
    description: 'Application is ready to serve traffic',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ready' },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        dependencies: {
          type: 'object',
          properties: {
            database: { type: 'boolean', example: true },
            redis: { type: 'boolean', example: true },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Application is not ready to serve traffic',
  })
  public async ready(): Promise<{
    status: string;
    timestamp: string;
    dependencies: Record<string, boolean>;
  }> {
    return await this.healthService.readiness();
  }
}
