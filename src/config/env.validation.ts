import { z } from 'zod';

/**
 * Environment variables validation schema with Zod
 *
 * Note: ESLint warnings for Zod are suppressed as this is a known limitation
 * with TypeScript type inference for external schema libraries in strict mode.
 */

export const envValidationSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),

  // Database connection (TimescaleDB)
  POSTGRES_HOST: z.string().default('localhost'),
  POSTGRES_PORT: z.coerce.number().default(5432),
  POSTGRES_DB: z.string().min(1),
  POSTGRES_USER: z.string().min(1),
  POSTGRES_PASSWORD: z.string().min(1),
  DATABASE_URL: z.string().url().optional(),

  // JWT Authentication
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('24h'),

  DATABASE_LOGGING: z
    .string()
    .default('false')
    .transform(val => val === 'true')
    .pipe(z.boolean()),

  // Redis connection
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional().default(''),

  // pgAdmin
  PGADMIN_EMAIL: z.string().email().default('admin@geass.dev'),
  PGADMIN_PASSWORD: z.string().default('admin'),

  // Redis Commander
  REDIS_COMMANDER_USER: z.string().default('admin'),
  REDIS_COMMANDER_PASSWORD: z.string().default('admin'),
});

/**
 * Inferred TypeScript type from the Zod schema
 */
export type EnvironmentVariables = z.infer<typeof envValidationSchema>;

/**
 * Validates environment variables against the schema
 */
export function validateEnvironment(config: Record<string, unknown>): EnvironmentVariables {
  try {
    return envValidationSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors

        .map(err => `${err.path.join('.')}: ${err.message}`)

        .join(', ');
      throw new Error(`Environment validation failed: ${errorMessages}`);
    }
    throw error;
  }
}
