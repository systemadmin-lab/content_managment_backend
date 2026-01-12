# Smart Content Generator Feature Documentation

## Overview
The Smart Content Generator is a feature that allows users to generate AI-powered content (Blog Post Outlines, Product Descriptions, Social Media Captions) using a queued, asynchronous architecture. It integrates with OpenRouter (AI API) and leverages Redis for reliable job processing.

## Architecture
The system uses a producer-consumer pattern with a 1-minute delay mechanism:
1.  **API (Producer)**: Accepts requests, validates them, and pushes them to a Redis queue (BullMQ) with a 60-second delay. It returns a "202 Accepted" status immediately.
2.  **Redis Queue**: Holds the jobs until the delay expires. Powered by Redis Cloud.
3.  **Worker (Consumer)**: A separate Node.js process that monitors the queue, picks up ready jobs, calls the OpenRouter API, and updates the database with the results.
4.  **Database**: MongoDB stores job statuses (`queued`, `processing`, `completed`, `failed`) and the final generated content.

### Real-time Updates (Socket.IO)
Instead of polling, you can receive real-time updates when a job is completed.

**Connection**:
Connect to the root URL (e.g., `http://localhost:5000`) with your JWT token in the auth handshake.

**Client-side Example**:
```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  auth: {
    token: "YOUR_JWT_TOKEN"
  }
});

socket.on("connect", () => {
  console.log("Connected to notification server");
});

socket.on("job_completed", (jobData) => {
  console.log("Job Completed!", jobData);
});
```

**Event Payload (`jobData`)**:
```json
{
  "userId": "60d0fe4f5311236168a109ca",
  "jobId": "b84e3feb-19c9-4231-8893-0eba6bd61a63",
  "status": "completed",
  "generatedContent": "# Detailed Blog Outline...",
  "completedAt": "2026-01-11T19:34:23.039Z"
}
```

## API Reference

### 1. Queue Content Generation
**Endpoint**: `POST /generate-content`
**Auth**: Required (Bearer Token)
**Headers**: `Content-Type: application/json`

**Request Body**:
```json
{
  "prompt": "How to bake a sourdough bread",
  "contentType": "Blog Post Outline"
}
```

**Response (202 Accepted)**:
```json
{
  "message": "Content generation job queued successfully",
  "jobId": "b84e3feb-19c9-4231-8893-0eba6bd61a63",
  "status": "queued",
  "delaySeconds": 60,
  "scheduledFor": "2026-01-11T19:34:18.356Z",
  "estimatedCompletionTime": "2026-01-11T19:34:48.356Z"
}
```

### 2. Check Job Status
**Endpoint**: `GET /generate-content/:jobId`
**Auth**: Required

**Response**:
```json
{
  "jobId": "b84e3feb-19c9-4231-8893-0eba6bd61a63",
  "status": "completed", // queued, processing, completed, failed
  "generatedContent": "...", // Only present if completed
  "error": "..." // Only present if failed
}
```

### 3. List User Jobs
**Endpoint**: `GET /generate-content`
**Auth**: Required

**Response**: Array of job objects.

### 4. Save Generated Content
**Endpoint**: `POST /generate-content/:jobId/save`
**Auth**: Required
**Description**: Saves the generated content from a completed job into the permanent `Content` collection.

**Request Body**:
```json
{
  "title": "My Sourdough Guide" // Optional, defaults to auto-generated title
}
```

## Setup & Configuration

### Environment Variables
Ensure these are set in your `.env` file:
```env
# MongoDB
MONGO_URI=mongodb+srv://...

# Redis (Redis Cloud)
REDIS_ENDPOINT=your-redis-endpoint
REDIS_PORT=your-redis-port
REDIS_USER=default
REDIS_PASSWORD=your-redis-password

# OpenRouter AI
OPENROUTER_KEY=your-api-key
BASE_URL=https://openrouter.ai/api/v1
```

### Dependencies
- `bullmq`: Redis queue management
- `ioredis`: Redis client
- `uuid`: Unique ID generation

## Running the System

To run the full system (API + Worker), use the following npm script:

```bash
npm run dev:all
```

Or run them individually in separate terminals:
```bash
# Terminal 1: API Server
npm run dev

# Terminal 2: Background Worker
npm run worker
```

## Database Schema (Job)
The `Job` collection tracks the lifecycle of a generation request:
- `jobId`: Unique UUID
- `userId`: Reference to User
- `status`: `queued` -> `processing` -> `completed` / `failed`
- `prompt`: Original user prompt
- `contentType`: Type of content requested
- `generatedContent`: The AI output (once completed)
- `scheduledFor`: Timestamp when the job is allowed to run
