# AI Content Generator Backend for env you. can check your email

A robust backend service for an AI-powered content generation application. This project features a job queue system for asynchronous processing, real-time updates via WebSockets, and integration with the OpenRouter API for generating high-quality text content.

##  Project Overview

This backend handles user authentication, content management, and the core AI generation workflow. It is designed to handle long-running AI tasks efficiently by offloading them to a Redis-based queue (BullMQ).

### Key Features
*   **Secure Authentication**: JWT-based auth with `bcrypt` password hashing.
*   **Asynchronous AI Processing**: Uses **BullMQ** and **Redis** to queue generation requests, ensuring the API remains responsive.
*   **Separate Worker Process**: A dedicated worker handles the heavy lifting of communicating with the AI provider (OpenRouter).
*   **Real-time Notifications**: **Socket.IO** integration pushes "Job Completed" events to the client instantly.
*   **Content Management**: CRUD operations for saving and managing generated content.

## 🛠 Tech Stack

*   **Runtime**: Node.js
*   **Language**: TypeScript
*   **Framework**: Express.js
*   **Database**: MongoDB (via Mongoose)
*   **Queue System**: BullMQ
*   **Cache/Message Broker**: Redis (ioredis)
*   **LLM AI Provider**: OpenRouter API
*   **Real-time Communication**: Socket.IO

##  Architecture & Decisions

### Why a Queue System?
AI content generation can take time (from a few seconds to a minute). Handling this synchronously in the HTTP request would block the client and lead to timeouts. We chose **BullMQ** (built on Redis) to:
1.  **Decouple** the request acceptance from processing.
2.  **Retry** failed jobs automatically.
3.  **Rate Limit** calls to the external AI API (configured for max 10 jobs/minute).

### Worker Isolation
The worker logic resides in `src/worker.ts`. It runs as a separate process from the main Express API. This allows:
*   Independent scaling (e.g., add more workers without adding more API servers).
*   Stability (if the worker crashes, the API stays up).

### Real-time Feedback
Since generation is async, clients shouldn't have to poll for status. We use **Socket.IO** combined with Redis Pub/Sub. When the worker finishes a job, it publishes an event; the API server subscribes to this and forwards the notification to the specific connected user.

##  API Documentation

All routes (except auth) are protected and require a valid Bearer Token.

### Authentication (`/auth`)
*   `POST /auth/register` - Create a new account.
*   `POST /auth/login` - Login and receive a JWT.
*   `GET /auth/me` - Get current user profile.

### AI Generation (`/generate-content`)
*   `POST /generate-content` - Enqueue a new generation job.
    *   Body: `{ "prompt": "...", "contentType": "blog-post" }`
*   `GET /generate-content` - List all generation jobs for the user.
*   `GET /generate-content/:jobId` - Check status of a specific job.
*   `POST /generate-content/:jobId/save` - Save the result of a completed job to the permanent content library.

### Content Management (`/content`)
*   `GET /content` - Retrieve saved content.
*   `POST /content` - manually create content.
*   `PUT /content/:id` - Update content.
*   `DELETE /content/:id` - Remove content.

## 💻 Setup Instructions

### Prerequisites
*   Node.js (v18+)
*   MongoDB
*   Redis (Running locally or cloud)

### 1. Clone & Install
```bash
git clone <repository-url>
cd ai-back-end
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/ai-content-db
JWT_SECRET=your_super_secret_key_change_this

# Redis Configuration
REDIS_ENDPOINT=localhost
REDIS_PORT=6379
# REDIS_USER=default  # Optional
# REDIS_PASSWORD=     # Optional

# External AI API
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=google/gemini-2.0-flash-exp:free
```

### 3. Run Locally
To run both the API server and the Queue Worker simultaneously:

```bash
npm run dev
```

*   **API Server**: http://localhost:3000
*   **Worker**: Runs in the background (terminal output will show `[Worker]` logs).

### Individual Commands
*   `npm run dev`: Run only the Express API.
*   `npm run worker:dev`: Run only the Queue Worker.
*   `npm run build`: Compile TypeScript to JavaScript.

##  Live Deployment

[Link pending]
