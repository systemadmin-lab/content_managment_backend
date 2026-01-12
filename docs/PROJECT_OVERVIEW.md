# AI Content Generator: Full Project Technical Overview

This document outlines the complete implementation of the backend system, detailing the architecture, integrations, and feature sets.

---

## 1. Core Architecture
The project follows a modular Node.js/Express architecture using TypeScript, with a separate background worker process for decoupled task execution.

- **Primary Stack**: Node.js, Express, TypeScript, MongoDB (Mongoose), Redis (Cloud).
- **Tooling**: BullMQ (Job Scheduling), Socket.io (Real-time), OpenRouter (AI).

---

## 2. Feature Implementation Details

### 2.1 User Authentication & Authorization
- **Implementation**: `src/controllers/authController.ts` & `src/routes/userRoutes.ts`.
- **Logic**: Full implementation of User registration and login using `bcrypt` for password hashing and `jsonwebtoken` (JWT) for secure session management.
- **Middleware**: `src/middleware/authMiddleware.ts` provides a `protect` function to verify tokens and attach user context to requests.

### 2.2 Content Management (CRUD)
- **Implementation**: `src/controllers/contentController.ts` & `src/routes/contentRoutes.ts`.
- **Capabilities**:
  - **Create**: Store generated or custom content.
  - **Read**: Fetch user-specific content with search/filter capabilities.
  - **Update**: Modify titles or bodies of existing content.
  - **Delete**: Remove content from the user's library.
- **Schema**: `src/schemas/contentSchema.ts` defines the structure (User ID, Title, Type, Body).

### 2.3 Smart Content Generator (AI Integration)
This is the core feature utilizing a delayed-job architecture.

- **AI Service**: `src/services/openRouterService.ts` handles communication with **OpenRouter**. It maps user request types (`Blog Post Outline`, etc.) to specific sophisticated system prompts.
- **Queue System**: `src/config/queue.ts` configures **BullMQ** with a Redis Cloud connection and defines a **1-minute delay** for all AI jobs.
- **Job Tracking**: `src/schemas/jobSchema.ts` persists the state of every AI request (`queued`, `processing`, `completed`, `failed`).
- **Endpoints**: `src/controllers/generateController.ts` provides the logic for queueing requests and retrieving job states.

### 2.4 Background Worker Process
- **Implementation**: `src/worker.ts`.
- **Functionality**: A completely separate process that runs independently of the API server.
- **Logic**: 
  1. Monitors the Redis queue.
  2. Respects the **60,000ms delay**.
  3. Executes the AI API call.
  4. Updates the MongoDB Job record.
  5. Publishes a completion signal to Redis for the WebSocket server.

### 2.5 Real-time Updates (WebSockets)
- **Implementation**: `src/app.ts`.
- **Logic**: 
  - Integrated **Socket.io** into the Express server.
  - Implemented a **Redis Pub/Sub** bridge. because the Worker and API run in different contexts, the Worker publishes a message to Redis, which the API server catches and forwards to the specific user's socket connection.
  - **Auth**: Handshake-level JWT validation for security.

---

## 3. Database Design
- **Users**: Identity and password storage.
- **Contents**: The final, saved library of AI-generated documents.
- **Jobs**: Temporary tracking of the AI generation lifecycle (captures prompt, status, and raw AI output).

---

## 4. Key Security & Performance Features
- **Environment Management**: Centralized config using `.env`.
- **Rate Limiting**: Worker concurrency is limited to 5 jobs at a time to stay within OpenRouter API limits.
- **Data Integrity**: Schema-level validation for content types and user ownership.
- **Decoupling**: The API server remains fast and responsive because it never waits for the AI model; it simply hands off tasks to Redis.
