# Task Management API

A production-ready REST API for task management with authentication, search, and project organization.

## Features

- JWT authentication with refresh tokens
- Role-based access control (Admin, Manager, Member)
- Full-text search with advanced filtering
- Project organization with team management
- Rate limiting and request validation
- Comprehensive error handling

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

## API Endpoints

### Authentication

| Method | Endpoint              | Description         |
| ------ | --------------------- | ------------------- |
| POST   | /api/auth/register    | Register new user   |
| POST   | /api/auth/login       | Login               |
| POST   | /api/auth/refresh     | Refresh token       |
| POST   | /api/auth/logout      | Logout              |

### Tasks

| Method | Endpoint              | Description                    |
| ------ | --------------------- | ------------------------------ |
| GET    | /api/tasks            | List tasks (with search)       |
| POST   | /api/tasks            | Create task                    |
| GET    | /api/tasks/:id        | Get task by ID                 |
| PUT    | /api/tasks/:id        | Update task                    |
| DELETE | /api/tasks/:id        | Delete task                    |
| PATCH  | /api/tasks/:id/status | Update task status             |

### Projects

| Method | Endpoint                 | Description         |
| ------ | ------------------------ | ------------------- |
| GET    | /api/projects            | List projects       |
| POST   | /api/projects            | Create project      |
| GET    | /api/projects/:id        | Get project by ID   |
| PUT    | /api/projects/:id        | Update project      |
| DELETE | /api/projects/:id        | Delete project      |

### Search

| Method | Endpoint              | Description               |
| ------ | --------------------- | ------------------------- |
| GET    | /api/search/tasks     | Advanced task search      |
| GET    | /api/search/projects  | Project search            |

## Query Parameters

### Task Search

```typescript
{
  query?: string;           // Full-text search
  status?: TaskStatus[];    // Filter by status
  priority?: Priority[];    // Filter by priority
  assigneeId?: string;      // Filter by assignee
  projectId?: string;       // Filter by project
  tags?: string[];          // Filter by tags (AND)
  createdAfter?: Date;      // Created date range
  createdBefore?: Date;
  dueAfter?: Date;          // Due date range
  dueBefore?: Date;
  estimatedHoursMin?: number;
  estimatedHoursMax?: number;
  page?: number;            // Pagination (default: 1)
  pageSize?: number;        // Items per page (default: 20, max: 100)
}
```

## Authentication

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secure123","name":"John"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secure123"}'

# Use token
curl http://localhost:3000/api/tasks \
  -H "Authorization: Bearer <token>"
```

## Environment Variables

```env
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/taskdb
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
CORS_ORIGIN=http://localhost:3001
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
```

## Development

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Lint code
npm run typecheck    # Type checking
```

## Architecture

```
src/
├── core/           # IoC container, events, cache
├── middleware/      # Auth, rate limiter, security
├── services/       # Business logic
├── repositories/   # Data access layer
├── controllers/    # Route handlers
├── models/         # Type definitions
└── utils/          # Helpers and validators
```
