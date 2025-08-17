import { ConfigService } from '@nestjs/config';

import Redis from 'ioredis';

import { EnvironmentVariables } from './env.validation';

/**
 * Simple Redis client factory for MVP
 * Can be used for both cache and pub/sub in Sprint 4
 */
export const createRedisClient = (configService: ConfigService<EnvironmentVariables>): Redis => {
  return new Redis({
    host: configService.get('REDIS_HOST') as string,

    port: configService.get('REDIS_PORT') as number,

    password: (configService.get('REDIS_PASSWORD') as string) ?? undefined,

    // Basic connection settings for MVP
    connectTimeout: 10000,
    maxRetriesPerRequest: 3,
  });
};
