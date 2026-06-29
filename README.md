# DSA Roadmap

A curated DSA learning platform built with React, Spring Boot, and PostgreSQL.

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Java 21 (if running backend locally without Docker)
- Node.js (if running frontend locally without Docker)

### Running with Docker Compose
1. Ensure ports `8080`, `5173`, and `5432` are available.
2. Run `docker-compose up -d --build`.
3. Access the frontend at `http://localhost:5173`.
4. Access backend APIs at `http://localhost:8080`.

### Running Locally

**Backend:**
```bash
cd backend
./mvnw spring-boot:run
```
(Requires Postgres running on port 5432)

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
