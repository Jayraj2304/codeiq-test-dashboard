# TaskFlow API

A task management REST API built with Express, TypeScript, and Prisma.

## Features
- User authentication with JWT
- CRUD operations for tasks and projects
- Role-based access control
- Rate limiting and input validation

## Getting Started
`ash
npm install
npm run dev
`

## API Endpoints
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login
- GET /api/tasks - List tasks
- POST /api/tasks - Create task
- PUT /api/tasks/:id - Update task
- DELETE /api/tasks/:id - Delete task
