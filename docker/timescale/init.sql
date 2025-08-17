-- Database Setup for Geass Trading Platform

-- Basic extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- Enable TimescaleDB extension for time-series data
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- Basic market data table for OHLCV data
CREATE TABLE market_data (
    time TIMESTAMPTZ NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    open DECIMAL(20,8) NOT NULL,
    high DECIMAL(20,8) NOT NULL,
    low DECIMAL(20,8) NOT NULL,
    close DECIMAL(20,8) NOT NULL,
    volume DECIMAL(20,8) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Convert to hypertable for time-series optimization
SELECT create_hypertable('market_data', 'time');

-- Basic indexes for market data queries
CREATE INDEX idx_market_data_symbol_time ON market_data (symbol, time DESC);



-- Table for real-time price updates (will be used with Redis pub/sub)
CREATE TABLE price_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) NOT NULL,
    price DECIMAL(20,8) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);


-- Insert sample user
INSERT INTO users (email, password_hash, first_name, last_name) VALUES
    ('admin@geass.dev', '$2b$10$K8BvBmN8yF8D4N9yF8BmN8yF8D4N9yF8BmN8yF8D4N9yF8BmN8yF8', 'Admin', 'User');

-- Insert sample market data
INSERT INTO market_data (time, symbol, open, high, low, close, volume) VALUES
    (NOW() - INTERVAL '1 hour', 'BTCUSDT', 50000.00, 50100.00, 49900.00, 50050.00, 1.5),
    (NOW() - INTERVAL '59 minutes', 'BTCUSDT', 50050.00, 50200.00, 50000.00, 50150.00, 2.1);

SELECT 'MVP Database setup completed successfully' AS status;