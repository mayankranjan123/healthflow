# HealthFlow Clinic Management

## Setup

1. Start Postgres database and configure `JDBC_DATABASE_URL` environment variable.
2. Set `JWT_SECRET` environment variable for token generation.
3. Start Backend: `cd backend && ./mvnw spring-boot:run`
4. On first launch, call `/api/setup/init` to seed initial roles and default admin/doctor/staff users.
5. Start Frontend: `cd frontend && npm run dev`
6. Login at http://localhost:5173 with `admin@healthflow.com` / `password123`.

## Architecture
- Spring Boot (Java 17, Data JPA, Security with JWT)
- React (Vite, TypeScript, Tailwind CSS, Recharts)
- PostgreSQL
