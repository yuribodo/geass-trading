#!/bin/sh
set -e

echo "🚀 Starting Geass Trading Application..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until nc -z ${POSTGRES_HOST:-timescale} ${POSTGRES_PORT:-5432}; do
  echo "Database is unavailable - sleeping"
  sleep 1
done
echo "✅ Database is ready!"

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "📊 Running database migrations..."
npx prisma db push

# Initialize TimescaleDB (create hypertables)
echo "⏰ Initializing TimescaleDB..."
npx prisma db seed

echo "🎉 Application ready! Starting server..."

# Start the application
exec "$@"