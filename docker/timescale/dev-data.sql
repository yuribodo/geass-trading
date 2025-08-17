-- Development sample data for Geass Trading Platform
-- This script populates the database with realistic sample data for development and testing

-- ================================
-- Sample Users
-- ================================

INSERT INTO user_data.users (id, email, password_hash, first_name, last_name, email_verified) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'admin@geass.dev', '$2b$10$K8BvBmN8yF8D4N9yF8BmN8yF8D4N9yF8BmN8yF8D4N9yF8BmN8yF8', 'Admin', 'User', true),
    ('550e8400-e29b-41d4-a716-446655440002', 'trader@geass.dev', '$2b$10$K8BvBmN8yF8D4N9yF8BmN8yF8D4N9yF8BmN8yF8D4N9yF8BmN8yF8', 'Pro', 'Trader', true),
    ('550e8400-e29b-41d4-a716-446655440003', 'demo@geass.dev', '$2b$10$K8BvBmN8yF8D4N9yF8BmN8yF8D4N9yF8BmN8yF8D4N9yF8BmN8yF8', 'Demo', 'User', true);

-- ================================
-- Sample Trading Accounts
-- ================================

INSERT INTO trading.accounts (id, user_id, account_type, exchange, is_active) VALUES
    ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'spot', 'binance', true),
    ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'futures', 'binance', true),
    ('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'spot', 'demo', true);

-- ================================
-- Sample Market Data (OHLCV)
-- ================================

-- Generate sample OHLCV data for the last 24 hours
WITH RECURSIVE sample_data AS (
    -- Base case: start 24 hours ago
    SELECT 
        NOW() - INTERVAL '24 hours' as time,
        'BTCUSDT' as symbol,
        '1m' as timeframe,
        50000.0 as price_base
    
    UNION ALL
    
    -- Recursive case: add 1 minute intervals
    SELECT 
        time + INTERVAL '1 minute',
        symbol,
        timeframe,
        -- Simple random walk for realistic price movement
        price_base + (RANDOM() - 0.5) * 100 
    FROM sample_data
    WHERE time < NOW() - INTERVAL '1 minute'
),
ohlcv_generated AS (
    SELECT 
        time,
        symbol,
        timeframe,
        price_base as open,
        price_base + ABS((RANDOM() - 0.5) * 50) as high,
        price_base - ABS((RANDOM() - 0.5) * 50) as low,
        price_base + (RANDOM() - 0.5) * 20 as close,
        RANDOM() * 10 + 0.1 as volume,
        (price_base + (RANDOM() - 0.5) * 20) * (RANDOM() * 10 + 0.1) as quote_volume,
        (RANDOM() * 200 + 50)::INTEGER as trades_count
    FROM sample_data
)
INSERT INTO market_data.ohlcv (time, symbol, timeframe, open, high, low, close, volume, quote_volume, trades_count)
SELECT 
    time,
    symbol,
    timeframe,
    open::DECIMAL(20,8),
    GREATEST(high, open, close)::DECIMAL(20,8) as high,
    LEAST(low, open, close)::DECIMAL(20,8) as low,
    close::DECIMAL(20,8),
    volume::DECIMAL(20,8),
    quote_volume::DECIMAL(20,8),
    trades_count
FROM ohlcv_generated;

-- Add data for ETHUSDT as well
WITH RECURSIVE eth_data AS (
    SELECT 
        NOW() - INTERVAL '24 hours' as time,
        'ETHUSDT' as symbol,
        '1m' as timeframe,
        3000.0 as price_base
    
    UNION ALL
    
    SELECT 
        time + INTERVAL '1 minute',
        symbol,
        timeframe,
        price_base + (RANDOM() - 0.5) * 30
    FROM eth_data
    WHERE time < NOW() - INTERVAL '1 minute'
),
eth_ohlcv AS (
    SELECT 
        time,
        symbol,
        timeframe,
        price_base as open,
        price_base + ABS((RANDOM() - 0.5) * 20) as high,
        price_base - ABS((RANDOM() - 0.5) * 20) as low,
        price_base + (RANDOM() - 0.5) * 10 as close,
        RANDOM() * 100 + 1 as volume,
        (price_base + (RANDOM() - 0.5) * 10) * (RANDOM() * 100 + 1) as quote_volume,
        (RANDOM() * 150 + 30)::INTEGER as trades_count
    FROM eth_data
)
INSERT INTO market_data.ohlcv (time, symbol, timeframe, open, high, low, close, volume, quote_volume, trades_count)
SELECT 
    time,
    symbol,
    timeframe,
    open::DECIMAL(20,8),
    GREATEST(high, open, close)::DECIMAL(20,8) as high,
    LEAST(low, open, close)::DECIMAL(20,8) as low,
    close::DECIMAL(20,8),
    volume::DECIMAL(20,8),
    quote_volume::DECIMAL(20,8),
    trades_count
FROM eth_ohlcv;

-- ================================
-- Sample Orders
-- ================================

INSERT INTO trading.orders (
    account_id, exchange_order_id, symbol, side, type, status, 
    quantity, price, filled_quantity, average_price, created_at
) VALUES
    ('650e8400-e29b-41d4-a716-446655440001', 'BIN_001', 'BTCUSDT', 'buy', 'limit', 'filled', 0.1, 49500.00, 0.1, 49500.00, NOW() - INTERVAL '2 hours'),
    ('650e8400-e29b-41d4-a716-446655440001', 'BIN_002', 'BTCUSDT', 'sell', 'limit', 'filled', 0.05, 50200.00, 0.05, 50200.00, NOW() - INTERVAL '1 hour'),
    ('650e8400-e29b-41d4-a716-446655440002', 'BIN_003', 'ETHUSDT', 'buy', 'market', 'filled', 2.0, NULL, 2.0, 2980.50, NOW() - INTERVAL '30 minutes'),
    ('650e8400-e29b-41d4-a716-446655440003', 'DEMO_001', 'BTCUSDT', 'buy', 'limit', 'new', 0.01, 49000.00, 0, NULL, NOW() - INTERVAL '5 minutes');

-- ================================
-- Sample Positions
-- ================================

INSERT INTO trading.positions (account_id, symbol, quantity, average_price, unrealized_pnl) VALUES
    ('650e8400-e29b-41d4-a716-446655440001', 'BTCUSDT', 0.05, 49500.00, 25.00),
    ('650e8400-e29b-41d4-a716-446655440002', 'ETHUSDT', 2.0, 2980.50, 39.00),
    ('650e8400-e29b-41d4-a716-446655440003', 'BTCUSDT', 0.0, 0, 0);

-- ================================
-- Sample Order Book Data (Recent)
-- ================================

-- Generate realistic order book data for the last hour
WITH RECURSIVE orderbook_times AS (
    SELECT NOW() - INTERVAL '1 hour' as time
    UNION ALL
    SELECT time + INTERVAL '5 minutes'
    FROM orderbook_times
    WHERE time < NOW() - INTERVAL '5 minutes'
)
INSERT INTO market_data.orderbook (time, symbol, bids, asks)
SELECT 
    time,
    'BTCUSDT',
    jsonb_build_array(
        jsonb_build_array((50000 - RANDOM() * 10)::TEXT, (RANDOM() * 5)::TEXT),
        jsonb_build_array((50000 - RANDOM() * 20)::TEXT, (RANDOM() * 10)::TEXT),
        jsonb_build_array((50000 - RANDOM() * 30)::TEXT, (RANDOM() * 15)::TEXT)
    ) as bids,
    jsonb_build_array(
        jsonb_build_array((50000 + RANDOM() * 10)::TEXT, (RANDOM() * 5)::TEXT),
        jsonb_build_array((50000 + RANDOM() * 20)::TEXT, (RANDOM() * 10)::TEXT),
        jsonb_build_array((50000 + RANDOM() * 30)::TEXT, (RANDOM() * 15)::TEXT)
    ) as asks
FROM orderbook_times;

-- ================================
-- Sample Individual Trades
-- ================================

-- Generate sample trades for the last hour
WITH RECURSIVE trade_times AS (
    SELECT 
        NOW() - INTERVAL '1 hour' as time,
        1 as counter
    UNION ALL
    SELECT 
        time + INTERVAL '30 seconds',
        counter + 1
    FROM trade_times
    WHERE time < NOW() - INTERVAL '30 seconds' AND counter < 120
)
INSERT INTO market_data.trades (time, symbol, trade_id, price, quantity, side, is_buyer_maker)
SELECT 
    time,
    'BTCUSDT',
    'TRADE_' || counter::TEXT,
    (50000 + (RANDOM() - 0.5) * 100)::DECIMAL(20,8),
    (RANDOM() * 2 + 0.01)::DECIMAL(20,8),
    CASE WHEN RANDOM() > 0.5 THEN 'buy' ELSE 'sell' END,
    RANDOM() > 0.5
FROM trade_times;

-- ================================
-- Create some indexes on sample data for better performance
-- ================================

-- Refresh continuous aggregates to include sample data
CALL refresh_continuous_aggregate('analytics.ohlcv_1h', NULL, NULL);
CALL refresh_continuous_aggregate('analytics.ohlcv_1d', NULL, NULL);

-- ================================
-- Display sample data summary
-- ================================

-- Show data summary
SELECT 
    'OHLCV Records' as data_type,
    COUNT(*) as count,
    MIN(time) as earliest,
    MAX(time) as latest
FROM market_data.ohlcv

UNION ALL

SELECT 
    'Order Records' as data_type,
    COUNT(*) as count,
    MIN(created_at) as earliest,
    MAX(created_at) as latest
FROM trading.orders

UNION ALL

SELECT 
    'User Records' as data_type,
    COUNT(*) as count,
    MIN(created_at) as earliest,
    MAX(created_at) as latest
FROM user_data.users

UNION ALL

SELECT 
    'Trade Records' as data_type,
    COUNT(*) as count,
    MIN(time) as earliest,
    MAX(time) as latest
FROM market_data.trades;

-- Show latest prices
SELECT 
    symbol,
    timeframe,
    time,
    close as price,
    volume
FROM market_data.ohlcv 
WHERE time >= NOW() - INTERVAL '10 minutes'
ORDER BY symbol, time DESC
LIMIT 10;

SELECT 'Development sample data loaded successfully' AS status;