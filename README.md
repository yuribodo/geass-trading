# Geass Trading Platform

A high-performance trading platform built with NestJS, featuring real-time market data processing, advanced analytics, and secure user management.

## Features

- **Real-time Market Data**: WebSocket-based streaming of market data with Redis pub/sub
- **TimescaleDB Integration**: Optimized time-series database for financial data storage
- **Authentication & Security**: JWT-based authentication with role-based access control
- **API Documentation**: Dual documentation interfaces (Swagger UI + Scalar API Reference)
- **Microservices Architecture**: Modular design following Domain-Driven Design principles
- **Docker Support**: Complete containerized development and production environment
- **High Performance**: Redis caching and optimized database queries
- **Testing**: Comprehensive test suite with unit, integration, and e2e tests

## Tech Stack

- **Backend**: NestJS (Node.js + TypeScript)
- **Database**: PostgreSQL with TimescaleDB extension
- **Cache/Pub-Sub**: Redis
- **ORM**: Prisma
- **Authentication**: JWT with Passport
- **API Documentation**: Swagger UI + Scalar API Reference
- **Container**: Docker & Docker Compose
- **Testing**: Jest + Supertest

## Quick Start

### Prerequisites

- **Docker** (20.10+) and **Docker Compose** (2.0+)
- **Node.js** (18+) for local development (optional)
- **pnpm** (recommended) or npm

### Environment Setup

1. **Copy environment template**:

   ```bash
   cp .env.example .env
   ```

2. **Update critical variables in `.env`**:

   ```bash
   # Generate a secure JWT secret
   JWT_SECRET=your-super-secret-jwt-key-here

   # Update database credentials for production
   POSTGRES_PASSWORD=your-secure-password
   ```

### Development with Docker

```bash
# Start all services in development mode
pnpm run docker:dev

# View logs
pnpm run docker:logs

# Stop services
pnpm run docker:down
```

**Services Available:**

- **Application**: http://localhost:3000
- **API Documentation (Swagger)**: http://localhost:3000/docs
- **API Documentation (Scalar)**: http://localhost:3000/reference
- **Health Check**: http://localhost:3000/health
- **pgAdmin**: http://localhost:8080 (admin@geass.dev / admin)
- **Redis Commander**: http://localhost:8081 (admin / admin)

### Local Development

```bash
# Install dependencies
pnpm install

# Start in development mode
pnpm run start:dev

# Start with debug mode
pnpm run start:debug
```

## 🚀 How to Run the Application

### Option 1: Docker (Recommended)

#### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+

#### Detailed Steps

1. **Clone the repository and configure the environment**:

   ```bash
   git clone <repository-url>
   cd Geass-Trading
   cp .env.example .env
   ```

2. **Start the development environment**:

   ```bash
   pnpm run docker:dev
   ```

   This command will:
   - 🐳 Build Docker images
   - 🗄️ Start PostgreSQL with TimescaleDB
   - 🔴 Start Redis
   - 🚀 Compile and run the NestJS application

3. **Wait for complete initialization**. You will see logs similar to:

   ```
   [Nest] Starting Nest application...
   [PrismaService] 🗄️ Database connected successfully
   [PrismaService] ⏰ TimescaleDB extension enabled
   [PrismaService] 📊 market_data hypertable created/verified
   [Bootstrap] 🚀 Application running on: http://localhost:3000
   [Bootstrap] 📚 Swagger UI available at: http://localhost:3000/docs
   [Bootstrap] 📖 Scalar API Reference available at: http://localhost:3000/reference
   ```

4. **Test the application**:

   ```bash
   # Test the health check
   curl http://localhost:3000/health

   # Or access in browser
   open http://localhost:3000/health
   ```

#### First Run - Database Setup

If this is the first execution, Prisma may need to generate the client:

```bash
# Enter the application container
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec app sh

# Generate Prisma client
pnpm run db:generate

# Sync database schema (development)
pnpm run db:push

# Exit container
exit

# Restart application
docker compose -f docker-compose.yml -f docker-compose.dev.yml restart app
```

### Option 2: Local Development

#### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- PostgreSQL 14+ with TimescaleDB
- Redis 6+

#### Manual Setup

1. **Configure PostgreSQL database**:

   ```sql
   CREATE DATABASE geass_trading;
   CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;
   ```

2. **Configure the `.env` file**:

   ```bash
   NODE_ENV=development
   PORT=3000
   DATABASE_URL="postgresql://postgres:password@localhost:5432/geass_trading?schema=public"
   REDIS_HOST=localhost
   REDIS_PORT=6379
   JWT_SECRET="your-jwt-secret-here"
   ```

3. **Install dependencies and setup database**:

   ```bash
   pnpm install
   pnpm run db:generate
   pnpm run db:push
   ```

4. **Run the application**:
   ```bash
   pnpm run start:dev
   ```

## 📚 API Documentation

The application offers **two documentation interfaces**:

### 🔷 Swagger UI (Traditional)

- **URL**: http://localhost:3000/docs
- Traditional Swagger interface
- Allows direct endpoint testing
- Complete schema visualization

### ⚡ Scalar API Reference (Modern)

- **URL**: http://localhost:3000/reference
- Modern and responsive interface
- Better visual experience
- Intuitive navigation

### 🔗 Main Endpoints

| Endpoint                | Description                   |
| ----------------------- | ----------------------------- |
| `GET /health`           | Application health check      |
| `GET /api/health/live`  | Liveness probe (Kubernetes)   |
| `GET /api/health/ready` | Readiness probe (Kubernetes)  |
| `GET /docs-json`        | OpenAPI specification in JSON |

## 🔧 Troubleshooting

### Issue: Error "Cannot find module '@prisma/client'"

**Solution**:

```bash
# In Docker
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec app pnpm run db:generate
docker compose -f docker-compose.yml -f docker-compose.dev.yml restart app

# Local
pnpm run db:generate
```

### Issue: "Cannot find module '/app/dist/main'"

**Solution**:

```bash
# Compile TypeScript manually
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec app npx tsc
```

### Issue: Database won't connect

**Check**:

1. If containers are running: `docker ps`
2. If environment variables are correct
3. If port 5432 is not being used by another process

### Issue: Application not responding

**Diagnostics**:

```bash
# Check logs
docker compose -f docker-compose.yml -f docker-compose.dev.yml logs app

# Test connectivity
curl -v http://localhost:3000/health

# Check if port is in use
lsof -i :3000  # On macOS/Linux
netstat -an | grep :3000  # On Windows
```

### Complete Reset

If you encounter persistent issues:

```bash
# Stop all services
pnpm run docker:down

# Remove volumes (WARNING: deletes database data)
docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v

# Rebuild everything
pnpm run docker:dev
```

## Scripts

### Development

```bash
pnpm run start:dev          # Development with hot reload
pnpm run start:debug        # Development with debug enabled
pnpm run start:prod         # Production mode
```

### Code Quality

```bash
pnpm run lint               # Lint and fix code
pnpm run typecheck          # TypeScript type checking
pnpm run format             # Format code with Prettier
pnpm run quality:check      # Run all quality checks
```

### Testing

```bash
pnpm run test               # Unit tests
pnpm run test:watch         # Unit tests in watch mode
pnpm run test:e2e           # End-to-end tests
pnpm run test:cov           # Test coverage report
```

### Database

```bash
pnpm run db:generate        # Generate Prisma client
pnpm run db:push            # Push schema to database
pnpm run db:migrate         # Run database migrations
pnpm run db:studio          # Open Prisma Studio
pnpm run db:seed            # Seed database with test data
```

### Docker

```bash
pnpm run docker:build       # Build application image
pnpm run docker:dev         # Development environment
pnpm run docker:prod        # Production environment
pnpm run docker:down        # Stop all services
pnpm run docker:shell       # Access container shell
```

## Project Structure

```
src/
├── modules/                 # Feature modules (bounded contexts)
│   ├── auth/               # Authentication & authorization
│   ├── user/               # User management
│   └── market-data/        # Market data processing
├── common/                  # Cross-cutting concerns
│   ├── decorators/         # Custom decorators
│   ├── filters/            # Exception filters
│   ├── guards/             # Auth & permission guards
│   └── interceptors/       # Request/response interceptors
├── config/                  # Configuration management
│   ├── env.validation.ts   # Environment validation
│   ├── prisma.service.ts   # Database configuration
│   └── redis.config.ts     # Cache configuration
└── main.ts                 # Application entry point
```

## Architecture

This project follows **Domain-Driven Design (DDD)** principles with **SOLID** architecture patterns:

- **Modular Architecture**: Each business domain is isolated in its own module
- **Dependency Injection**: Clean separation of concerns with NestJS IoC container
- **Repository Pattern**: Data access abstraction with Prisma ORM
- **Service Layer**: Business logic encapsulation
- **DTO Validation**: Input validation with class-validator decorators

## Development Workflow

1. **Feature Development**: Follow TDD (Test-Driven Development)
2. **Code Quality**: Automated linting, formatting, and type checking
3. **Testing**: Comprehensive test coverage with Jest
4. **Git Hooks**: Pre-commit hooks with Husky and lint-staged
5. **CI/CD Ready**: Docker-based deployment pipeline

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes following the coding standards
4. Run tests: `pnpm run quality:check`
5. Commit your changes: `git commit -m 'Add new feature'`
6. Push to the branch: `git push origin feature/new-feature`
7. Submit a pull request

## License

This project is [UNLICENSED](./LICENSE) - Private repository.
