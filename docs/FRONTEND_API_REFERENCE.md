# Smart Content Generator: Frontend API Specification (v1.1)

This specification defines the interaction model for the Smart Content Generator service. It is optimized for both human developers and AI-driven implementation tools.

---

## 1. Technical Overview

### 1.1 Connection Parameters
- **Base REST URL**: `http://localhost:5000`
- **WebSocket Protocol**: `Socket.io`
- **WebSocket URL**: `http://localhost:5000`

### 1.2 Global Security
All endpoints (REST and WebSocket handshakes) require a valid **JSON Web Token (JWT)**.
- **REST**: Include in the `Authorization` header as `Bearer <token>`.
- **WebSocket**: Include in the `auth` object during connection.

---

## 2. Shared Data Models

### 2.1 ContentType (Enum)
Type of AI generation requested.
- `Blog Post Outline`
- `Product Description`
- `Social Media Caption`

### 2.2 JobStatus (Enum)
Current lifecycle state of a generation request.
- `queued`: Request admitted, waiting for start (1-minute mandatory delay).
- `processing`: Worker is currently communicating with the AI model.
- `completed`: Content successfully generated and stored.
- `failed`: An error occurred during processing.

---

## 3. REST API Reference

### 3.1 [POST] Create Generation Job
Queues a new request for content generation.
- **Endpoint**: `/generate-content`
- **Request Body**:
  | Property | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `prompt` | `string` | Yes | The user's input/topic (e.g., "The future of AI"). |
  | `contentType` | `ContentType` | Yes | One of the allowed content type strings. |

- **Response (202 Accepted)**:
  ```json
  {
    "message": "Content generation job queued successfully",
    "jobId": "e30b91d2-...",
    "status": "queued",
    "delaySeconds": 60,
    "scheduledFor": "2026-01-12T08:00:00.000Z"
  }
  ```

### 3.2 [GET] Poll Job Status
Retrieves metadata and generated results for a specific job. Useful for page refreshes or if WebSockets are disconnected.
- **Endpoint**: `/generate-content/:jobId`
- **Response (200 OK)**:
  ```json
  {
    "jobId": "e30b91d2-...",
    "status": "completed",
    "contentType": "Blog Post Outline",
    "prompt": "The future of AI",
    "generatedContent": "# AI in 2030...", 
    "createdAt": "2026-01-12T07:59:00.000Z",
    "completedAt": "2026-01-12T08:00:15.000Z"
  }
  ```

### 3.3 [POST] Save Content to Library
Transfers generated content from a temporary "Job" state to the permanent "Content" library.
- **Endpoint**: `/generate-content/:jobId/save`
- **Request Body**:
  | Property | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `title` | `string` | No | Overrides the default title based on the prompt. |

- **Response (201 Created)**: Returns the newly created Content object.

### 3.4 [GET] Retrieve Request History
Fetches all recent generation jobs for the authenticated user.
- **Endpoint**: `/generate-content`
- **Response (200 OK)**: `Array<Job>`

---

## 4. Real-Time Integration (WebSockets)

WebSocket integration is **highly recommended** to avoid polling and improve the user experience.

### 4.1 Client Connection Setup
```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  auth: {
    token: localStorage.getItem("access_token") 
  }
});

socket.on("connect_error", (err) => {
  console.error("Auth Failed:", err.message);
});
```

### 4.2 Server -> Client Events

#### Event: `job_completed`
Emitted immediately when the worker finishes a job.
- **Payload**:
  ```json
  {
    "userId": "603e...",
    "jobId": "e30b91d2-...",
    "status": "completed",
    "generatedContent": "Markdown formatted AI output content...",
    "completedAt": "2026-01-12T08:00:15.000Z"
  }
  ```

---

## 5. Implementation Strategy for Frontend

1. **Submission**: Send `POST /generate-content`. Show the user a 60-second countdown timer based on `delaySeconds`.
2. **Listen**: While the timer runs, ensure the `socket` is connected and listening for `job_completed`.
3. **Display**: When the event fires, stop the timer and render the `generatedContent` (supports Markdown).
4. **Persist**: Offer the user a "Save to Library" button which triggers `POST /generate-content/:jobId/save`.
5. **Fallback**: If the user refreshes, use `GET /generate-content/:jobId` to check if it's already finished.
