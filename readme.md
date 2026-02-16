# 🚀 Enterprise-Grade Express.js TypeScript Template

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green)](https://www.mongodb.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)](https://www.prisma.io/)
[![Redis](https://img.shields.io/badge/Redis-7.x-red)](https://redis.io/)
[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)

A production-ready, enterprise-grade Express.js template with TypeScript, featuring comprehensive security, performance optimization, observability, and modern development tools.

**Created by:** Bryan Gabriel Rubio

---

## ✨ Features

### 🔒 Security

- ✅ **Helmet** - Security headers protection
- ✅ **Rate Limiting** - Brute-force and DDoS protection
- ✅ **Zod Validation** - Type-safe input validation
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **CORS** - Cross-origin resource sharing
- ✅ **Security Auditing** - Automated vulnerability scanning

### ⚡ Performance & Scalability

- ✅ **Redis Caching** - In-memory data caching
- ✅ **Compression** - Response compression (gzip)
- ✅ **PM2 Clustering** - Multi-core utilization
- ✅ **Graceful Shutdown** - Proper connection cleanup

### 📊 Observability

- ✅ **Winston Logger** - Advanced logging system
- ✅ **Morgan** - HTTP request logging
- ✅ **Health Checks** - Kubernetes-ready endpoints
- ✅ **Error Tracking** - Centralized error handling

### 🛠️ Development Tools

- ✅ **TypeScript** - Type safety with strict mode
- ✅ **ESLint & Prettier** - Code quality and formatting
- ✅ **Jest & Supertest** - Comprehensive testing
- ✅ **Swagger/OpenAPI** - API documentation
- ✅ **Docker** - Containerization support
- ✅ **CI/CD** - GitHub Actions workflows

### 🗄️ Data Management

- ✅ **MongoDB with Prisma ORM** - Type-safe data access
- ✅ **Generic Repository Pattern** - Reusable data access
- ✅ **Redis** - Caching and session storage
- ✅ **Nodemailer** - Email service

### 🤖 AI-Orchestrated Workflow

- ✅ **Multi-Agent Orchestration** - Specialized AI role definitions in `.orchestration/`
- ✅ **Agent Playbooks** - Task-focused guidance for API, backend, QA, security, and testing

### ⚙️ Feature Scaffolding

- ✅ **Feature Generator Script** - `npm run feature -- <name>` creates route/controller/service/repository/prisma files
- ✅ **Undo Feature Script** - `npm run undo -- feature <name>` removes generated feature files and route wiring

---

## 📁 Project Structure

```
Express-Template/
├── config/              # Configuration files
│   ├── db.ts           # Database connection
│   ├── logger.ts       # Winston logger config
│   ├── redis.ts        # Redis client config
│   └── ...
├── controllers/         # Request handlers
├── middleware/          # Express middleware
│   ├── authMiddleware.ts
│   ├── cacheMiddleware.ts
│   ├── error.ts
│   └── morganMiddleware.ts
├── prisma/             # Prisma ORM configuration and schema modules
│   └── schema/
│       ├── base.prisma
│       └── user.prisma
├── repository/         # Data access layer
│   ├── genericRepository.ts
│   └── userRepository.ts
├── routes/             # API routes
│   ├── healthRoutes.ts
│   └── userRoutes.ts
├── services/           # Business logic
├── socket/             # Socket.IO server and event definitions
├── scripts/            # Feature scaffolding/undo utilities
│   ├── create-feature.js
│   └── undo-feature.js
├── .orchestration/     # AI multi-agent orchestration docs and roles
├── util/               # Utilities and helpers
│   └── validation/     # Zod schemas
├── views/              # Email templates (EJS)
├── __tests__/          # Test files
├── .github/workflows/  # CI/CD pipelines
├── logs/               # Application logs
├── ecosystem.config.js # PM2 configuration
├── Dockerfile          # Docker configuration
├── docker-compose.yml  # Docker Compose
└── jest.config.js      # Jest configuration
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB 7+
- Redis 7+ (optional, for caching)
- Docker (optional)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/express-template.git
   cd express-template
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB and Redis** (if not using Docker)

   ```bash
   # MongoDB
   mongod

   # Redis
   redis-server
   ```

5. **Run in development mode**
   ```bash
   npm run dev
   ```

The server will start at `http://localhost:4400`

---

## 📜 Available Scripts

### Development

```bash
npm run dev              # Start development server with nodemon
npm run build            # Build TypeScript to JavaScript
npm start                # Start production server
```

### Prisma

```bash
npm run prisma:generate  # Generate Prisma client
npm run prisma:push      # Push schema changes to database
npm run prisma:pull      # Pull schema from database
npm run prisma:studio    # Open Prisma Studio
```

### Testing

```bash
npm test                 # Run tests with coverage
npm run test:watch       # Run tests in watch mode
```

### Code Quality

```bash
npm run lint             # Check for linting errors
npm run lint:fix         # Fix linting errors
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
```

### Security

```bash
npm run audit            # Check for vulnerabilities
npm run audit:fix        # Fix vulnerabilities
```

### Feature Scaffolding

```bash
npm run feature -- todo          # Scaffold a new feature module
npm run undo -- feature todo     # Undo/remove a generated feature
npm run undo:feature -- todo     # Alias for undo script
```

### PM2 Process Management

```bash
npm run pm2:start        # Start production cluster
npm run pm2:dev          # Start development mode
npm run pm2:stop         # Stop all processes
npm run pm2:restart      # Restart cluster
npm run pm2:delete       # Delete all processes
npm run pm2:logs         # View logs
npm run pm2:monit        # Monitor processes
```

---

## 🐳 Docker

### Using Docker Compose (Recommended)

```bash
# Start all services (app, MongoDB, Redis)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Build Docker Image Only

```bash
# Build image
docker build -t express-api .

# Run container
docker run -p 4400:4400 --env-file .env express-api
```

---

## 🏥 Health Checks

The template includes Kubernetes-ready health check endpoints:

- **GET /v1/api/health** - Overall health status

  ```json
  {
    "status": "OK",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "uptime": 3600.5,
    "database": { "status": "connected" },
    "memory": { "heapUsed": 45.23, "heapTotal": 100.5 }
  }
  ```

- **GET /v1/api/health/ready** - Readiness probe
- **GET /v1/api/health/live** - Liveness probe

---

## 📝 API Documentation

Swagger documentation is available at:

```
http://localhost:4400/api-docs
```

---

## 🔐 Environment Variables

See [.env.example](.env.example) for all configuration options:

```env
NODE_ENV=development
PORT=4400
MONGODB_URL_STRING=mongodb://localhost:27017/express-template
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

---

## 🧪 Testing

The template includes comprehensive testing setup:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# View coverage report
open coverage/lcov-report/index.html
```

Test files are located in `__tests__/` directory.

---

## 📊 Logging

Logs are stored in the `logs/` directory:

- `error.log` - Error logs only
- `combined.log` - All logs
- `exceptions.log` - Uncaught exceptions
- `rejections.log` - Unhandled promise rejections

Logs are automatically formatted with timestamps and colored for console output.

---

## 🚢 Deployment

### PM2 Deployment

```bash
# Build the application
npm run build

# Start with PM2
npm run pm2:start
```

### Docker Deployment

```bash
# Using Docker Compose
docker-compose up -d

# Or build and run manually
docker build -t express-api .
docker run -d -p 4400:4400 --env-file .env express-api
```

### CI/CD

The template includes GitHub Actions workflows:

- **CI Pipeline** (`.github/workflows/ci.yml`)
  - Linting and formatting checks
  - Tests on Node 18 and 20
  - Security audits
  - Build verification
  - Deployment triggers

- **CodeQL Security Scan** (`.github/workflows/codeql.yml`)
  - Automated security analysis
  - Runs weekly and on pull requests

---

## 🏗️ Architecture

This template follows a **layered architecture** with clear separation of concerns:

1. **Routes Layer** - HTTP endpoints
2. **Controllers Layer** - Request handling
3. **Services Layer** - Business logic
4. **Repository Layer** - Data access (Generic Repository Pattern)
5. **Prisma Schema Layer** - Database models and mappings

---

## 📚 Key Technologies

- **Runtime**: Node.js 20
- **Framework**: Express.js 4
- **Language**: TypeScript 5
- **Database**: MongoDB with Prisma ORM
- **Caching**: Redis
- **Authentication**: JWT + Cookies
- **Validation**: Zod
- **Testing**: Jest + Supertest
- **Logging**: Winston + Morgan
- **Process Manager**: PM2
- **Containerization**: Docker
- **CI/CD**: GitHub Actions

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 👨‍💻 Author

**Bryan Gabriel Rubio**

---

## 📖 Additional Documentation

For detailed information about enterprise features, see [ENTERPRISE_FEATURES.md](ENTERPRISE_FEATURES.md)

---

## 🙏 Acknowledgments

Built with industry best practices and recommendations from:

- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [The Twelve-Factor App](https://12factor.net/)

---

Made with ❤️ by Bryan Gabriel Rubio
