# Project Intelligence Platform (Spring Boot backend)

This folder contains the Spring Boot backend for the **AI-Powered Project & Resource Management Intelligence Platform**.

## What is included
- JWT Authentication (`/api/auth/register`, `/api/auth/login`)
- CRUD APIs:
  - Projects: `/api/projects`
  - Sprints: `/api/sprints`
  - Tasks: `/api/tasks`
  - Resources: `/api/resources`
  - Feedback: `/api/feedback`
- Prediction forwarding + persistence:
  - POST `/api/predict/{projectId}` forwards to Python FastAPI `POST /predict`

## Build / Run (Windows)
This project uses **Maven Wrapper** (no separate Maven install required).

```bat
cd /d "C:\Users\bbat3017\OneDrive - 7-Eleven, Inc\Desktop\development\7-11apps\AI-Powered-Project-Resource-Management-Intelligence-Platform\platform"

mvnw.cmd -DskipTests package
mvnw.cmd spring-boot:run
```

Swagger UI:
- http://localhost:8080/swagger-ui/index.html

## Configuration
Update `src/main/resources/application.properties` for your PostgreSQL credentials.

By default, it expects:
- DB: `platformdb`
- user/pass: `postgres` / `postgres`

Python ML service base URL:
- `app.ml.base-url=http://localhost:8000`
