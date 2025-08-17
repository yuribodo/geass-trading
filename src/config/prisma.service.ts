import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaClient } from '@prisma/client';

import { EnvironmentVariables } from './env.validation';

/**
 * Prisma Service for database operations
 * Manages connection lifecycle and provides Prisma client instance
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly configService: ConfigService<EnvironmentVariables>) {
    const isDevelopment = configService.get('NODE_ENV') === 'development';

    super({
      datasources: {
        db: {
          url: configService.get('DATABASE_URL'),
        },
      },
      log: isDevelopment ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
      errorFormat: 'pretty',
    });
  }

  public async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('🗄️  Database connected successfully');

      // Initialize TimescaleDB features
      await this.initializeTimescaleDB();
    } catch (error) {
      this.logger.error('Failed to connect to database', error);
      throw error;
    }
  }

  public async onModuleDestroy(): Promise<void> {
    try {
      await this.$disconnect();
      this.logger.log('🔌 Database disconnected');
    } catch (error) {
      this.logger.error('Error disconnecting from database', error);
    }
  }

  /**
   * Initialize TimescaleDB features
   */
  private async initializeTimescaleDB(): Promise<void> {
    try {
      await this.enableTimescaleDB();
      await this.createMarketDataHypertable();
    } catch (error) {
      this.logger.warn('TimescaleDB initialization warning (may already be configured)', error);
    }
  }

  /**
   * Enable TimescaleDB extension
   */
  private async enableTimescaleDB(): Promise<void> {
    try {
      await this.$executeRaw`CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;`;
      this.logger.log('⏰ TimescaleDB extension enabled');
    } catch (error) {
      this.logger.warn('TimescaleDB extension may already be enabled', error);
    }
  }

  /**
   * Create market_data hypertable for time-series data
   */
  private async createMarketDataHypertable(): Promise<void> {
    try {
      await this.$executeRaw`
        SELECT create_hypertable('market_data', 'time', if_not_exists => TRUE);
      `;
      this.logger.log('📊 market_data hypertable created/verified');
    } catch (error) {
      this.logger.warn('Hypertable may already exist or TimescaleDB not available', error);
    }
  }

  /**
   * Health check for database connection
   */
  public async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get database version and TimescaleDB info
   */
  public async getDatabaseInfo(): Promise<{
    version: string;
    timescaleVersion?: string;
  }> {
    try {
      const [versionResult] = await this.$queryRaw<Array<{ version: string }>>`
        SELECT version();
      `;

      let timescaleVersion: string | undefined;
      try {
        const [timescaleResult] = await this.$queryRaw<Array<{ version: string }>>`
          SELECT extversion as version FROM pg_extension WHERE extname = 'timescaledb';
        `;
        timescaleVersion = timescaleResult?.version;
      } catch {
        // TimescaleDB not available
      }

      return {
        version: versionResult.version,
        timescaleVersion,
      };
    } catch (error) {
      this.logger.error('Failed to get database info', error);
      throw error;
    }
  }
}
