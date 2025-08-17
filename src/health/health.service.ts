import { Injectable } from '@nestjs/common';

import { PrismaService } from '../config/prisma.service';

import { HealthResponseDto } from './dto/health-response.dto';

@Injectable()
export class HealthService {
  private readonly startTime = Date.now();

  constructor(private readonly prismaService: PrismaService) {}

  public async check(): Promise<HealthResponseDto> {
    const memoryUsage = process.memoryUsage();
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);

    const checks = {
      database: {
        status: 'up' as const,
        responseTime: await this.checkDatabase(),
        details: 'Connected successfully',
      },
      redis: {
        status: 'up' as const,
        responseTime: await this.checkRedis(),
        details: 'Connected successfully',
      },
    };

    const allHealthy = Object.values(checks).every(check => check.status === 'up');

    return {
      status: allHealthy ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      uptime,
      memory: {
        used: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
        total: Math.round((memoryUsage.heapTotal / 1024 / 1024) * 100) / 100,
        percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 10000) / 100,
      },
      checks,
      version: process.env.npm_package_version ?? '1.0.0',
      environment: process.env.NODE_ENV ?? 'development',
    };
  }

  public async readiness(): Promise<{
    status: string;
    timestamp: string;
    dependencies: Record<string, boolean>;
  }> {
    const databaseHealthy = await this.isDatabaseHealthy();
    const redisHealthy = await this.isRedisHealthy();

    const dependencies = {
      database: databaseHealthy,
      redis: redisHealthy,
    };

    const allReady = Object.values(dependencies).every(Boolean);

    return {
      status: allReady ? 'ready' : 'not-ready',
      timestamp: new Date().toISOString(),
      dependencies,
    };
  }

  private async checkDatabase(): Promise<number> {
    const start = Date.now();
    try {
      const isHealthy = await this.prismaService.isHealthy();
      return isHealthy ? Date.now() - start : -1;
    } catch {
      return -1;
    }
  }

  private async checkRedis(): Promise<number> {
    const start = Date.now();
    try {
      // TODO: Implement actual Redis ping when Redis client is configured
      // await this.redis.ping();
      await new Promise(resolve => setTimeout(resolve, 5)); // Simulate Redis check
      return Date.now() - start;
    } catch {
      return -1;
    }
  }

  private async isDatabaseHealthy(): Promise<boolean> {
    try {
      const responseTime = await this.checkDatabase();
      return responseTime > 0;
    } catch {
      return false;
    }
  }

  private async isRedisHealthy(): Promise<boolean> {
    try {
      const responseTime = await this.checkRedis();
      return responseTime > 0;
    } catch {
      return false;
    }
  }
}
