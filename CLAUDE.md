# NestJS Project Context

## Project Overview

This is a NestJS application following Domain-Driven Design (DDD), SOLID principles, and Test-Driven Development (TDD) methodology. The project emphasizes clean architecture, maintainability, and scalability.

## Architecture Decisions

### Core Technologies

- **Framework**: NestJS - chosen for enterprise-grade TypeScript support and modular architecture
- **ORM**: TypeORM/Prisma - for type-safe database operations
- **Testing**: Jest + Supertest - comprehensive testing suite
- **Documentation**: Swagger/OpenAPI - auto-generated API documentation
- **Validation**: class-validator - decorator-based validation

### Design Patterns Implemented

1. **Repository Pattern**: Abstraction layer between business logic and data access
2. **Service Layer Pattern**: Business logic encapsulation
3. **DTO Pattern**: Data transfer and validation
4. **Dependency Injection**: IoC container for loose coupling
5. **Module Pattern**: Feature-based modular organization

## Project Structure Explanation

```
src/
├── modules/                 # Feature modules (bounded contexts)
│   ├── auth/               # Authentication & authorization
│   ├── user/               # User management
│   └── [feature]/          # Other business features
├── common/                  # Cross-cutting concerns
│   ├── decorators/         # Custom decorators
│   ├── filters/            # Exception filters
│   ├── guards/             # Auth & permission guards
│   ├── interceptors/       # Request/response interceptors
│   └── pipes/              # Validation & transformation pipes
├── config/                  # Configuration management
│   ├── app.config.ts       # Application settings
│   ├── database.config.ts  # Database configuration
│   └── swagger.config.ts   # API documentation setup
├── database/               # Database related
│   ├── migrations/         # Database migrations
│   └── seeds/              # Seed data
└── shared/                 # Shared kernel
    ├── types/              # TypeScript type definitions
    └── utils/              # Utility functions
```

## SOLID Principles Implementation

### Single Responsibility Principle (SRP)

- Each service handles one business domain
- Controllers only handle HTTP concerns
- Repositories only handle data access
- DTOs only handle data validation

### Open/Closed Principle (OCP)

- Use decorators for extending functionality
- Strategy pattern for interchangeable algorithms
- Plugin architecture for features

### Liskov Substitution Principle (LSP)

- All implementations respect interface contracts
- Derived classes maintain base class behavior
- Use abstract classes for shared behavior

### Interface Segregation Principle (ISP)

- Small, focused interfaces
- Role-based interfaces (IReadable, IWritable)
- Optional interface members where appropriate

### Dependency Inversion Principle (DIP)

- Depend on abstractions (interfaces)
- Inject dependencies via constructor
- Use IoC container for dependency resolution

## TDD Workflow

### Red-Green-Refactor Cycle

1. **Red**: Write failing test first
2. **Green**: Write minimum code to pass
3. **Refactor**: Improve code maintaining tests

### Test Organization

```typescript
// user.service.spec.ts
describe('UserService', () => {
  describe('create', () => {
    it('should create a user with valid data', async () => {
      // Arrange: Setup test data and mocks
      const dto = createMockUserDto();

      // Act: Execute the method
      const result = await service.create(dto);

      // Assert: Verify expectations
      expect(result).toBeDefined();
      expect(result.email).toBe(dto.email);
    });

    it('should throw when email already exists', async () => {
      // Test failure scenarios
    });
  });
});
```

## Common Module Patterns

### Basic Module Structure

```typescript
// user.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), CommonModule],
  controllers: [UserController],
  providers: [UserService, UserRepository, UserMapper],
  exports: [UserService],
})
export class UserModule {}
```

### Service Implementation

```typescript
// user.service.ts
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    this.logger.log(`Creating user with email: ${dto.email}`);

    // Business logic validation
    await this.validateBusinessRules(dto);

    // Create entity
    const user = await this.userRepository.create(dto);

    // Emit domain event
    this.eventEmitter.emit('user.created', new UserCreatedEvent(user));

    return user;
  }

  private async validateBusinessRules(dto: CreateUserDto): Promise<void> {
    const exists = await this.userRepository.existsByEmail(dto.email);
    if (exists) {
      throw new ConflictException('Email already registered');
    }
  }
}
```

### Controller Implementation

```typescript
// user.controller.ts
@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 409, description: 'Conflict - Email exists' })
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.userService.create(dto);
    return UserMapper.toResponse(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', type: 'string' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserResponseDto> {
    const user = await this.userService.findById(id);
    return UserMapper.toResponse(user);
  }
}
```

## Database Patterns

### Entity Definition

```typescript
// user.entity.ts
@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  email: string;

  @Column({ select: false })
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => PostEntity, post => post.user)
  posts: PostEntity[];
}
```

### Repository Pattern

```typescript
// user.repository.ts
@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  async create(dto: CreateUserDto): Promise<UserEntity> {
    const entity = this.repository.create(dto);
    return this.repository.save(entity);
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['posts'],
    });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { email },
    });
    return count > 0;
  }
}
```

## Testing Strategies

### Unit Testing

```typescript
// Mock dependencies
const mockRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
};

// Test service in isolation
beforeEach(() => {
  service = new UserService(mockRepository as any);
});
```

### Integration Testing

```typescript
// Test with real database (test container)
beforeAll(async () => {
  const module = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = module.createNestApplication();
  await app.init();
});
```

### E2E Testing

```typescript
// Test complete request flow
it('/users (POST)', () => {
  return request(app.getHttpServer())
    .post('/users')
    .send(createUserDto)
    .expect(201)
    .expect(res => {
      expect(res.body).toHaveProperty('id');
    });
});
```

## Security Implementations

### Authentication Flow

1. User registers/logs in
2. Generate JWT token
3. Validate token on protected routes
4. Refresh token mechanism

### Authorization Patterns

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Get('admin')
async adminRoute() {
  // Protected admin route
}
```

## Performance Optimizations

### Caching Strategy

```typescript
@UseInterceptors(CacheInterceptor)
@CacheTTL(60)
@Get()
async findAll() {
  // Cached for 60 seconds
}
```

### Query Optimization

```typescript
// Use query builder for complex queries
const users = await this.userRepository
  .createQueryBuilder('user')
  .leftJoinAndSelect('user.posts', 'post')
  .where('user.active = :active', { active: true })
  .take(10)
  .getMany();
```

## Error Handling

### Custom Exceptions

```typescript
export class BusinessException extends HttpException {
  constructor(message: string, code: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message,
        code,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
```

### Global Exception Filter

```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Log exception
    // Format response
    // Send response
  }
}
```

## Configuration Management

### Environment Variables

```typescript
// .env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/db
JWT_SECRET=your-secret-key
REDIS_URL=redis://localhost:6379
```

### Configuration Service

```typescript
@Injectable()
export class ConfigService {
  get port(): number {
    return Number(process.env.PORT) || 3000;
  }

  get databaseUrl(): string {
    return process.env.DATABASE_URL;
  }

  get isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }
}
```

## Development Workflow

### Local Development

```bash
# Install dependencies
npm install

# Run database migrations
npm run migration:run

# Start development server
npm run start:dev

# Run tests in watch mode
npm run test:watch
```

### Database Migrations

```bash
# Generate migration
npm run migration:generate -- -n MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

## Code Quality Tools

### ESLint Configuration

```json
{
  "extends": ["@nestjs/eslint-config", "plugin:@typescript-eslint/recommended"],
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/no-explicit-any": "error"
  }
}
```

### Prettier Configuration

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100
}
```

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run test
      - run: npm run test:e2e
      - run: npm run build
```

## Monitoring and Logging

### Structured Logging

```typescript
this.logger.log({
  message: 'User created',
  userId: user.id,
  email: user.email,
  timestamp: new Date().toISOString(),
});
```

### Health Checks

```typescript
@Controller('health')
export class HealthController {
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.database.pingCheck('database'),
      () => this.redis.pingCheck('redis'),
    ]);
  }
}
```

## Common Pitfalls to Avoid

1. **Circular Dependencies**: Use forwardRef() or redesign module structure
2. **N+1 Queries**: Use eager loading or query builder
3. **Memory Leaks**: Properly close connections and clean up resources
4. **Synchronous Operations**: Always use async/await for I/O operations
5. **Missing Validation**: Always validate input with DTOs
6. **Hardcoded Values**: Use configuration service
7. **Poor Error Messages**: Provide clear, actionable error messages

## Resources and References

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [Jest Documentation](https://jestjs.io)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [TDD Best Practices](https://testdriven.io)

## Project Specific Context

### Current Implementation Status

- [ ] User module
- [ ] Authentication module
- [ ] Authorization (RBAC)
- [ ] File upload
- [ ] Email service
- [ ] Notification system
- [ ] Payment integration
- [ ] Reporting module

### Technical Debt

- List any known issues or improvements needed
- Track refactoring opportunities
- Document workarounds

### Performance Metrics

- Target response time: < 200ms
- Database query optimization target: < 50ms
- Test coverage target: > 80%
- Build time target: < 2 minutes

## Team Conventions

### Code Review Process

1. Create feature branch
2. Implement with TDD
3. Ensure all tests pass
4. Create pull request
5. Code review by team
6. Merge to main branch

### Definition of Done

- [ ] Code written following TDD
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] No console.logs
- [ ] Performance validated
- [ ] Security reviewed
