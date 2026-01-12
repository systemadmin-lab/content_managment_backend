# Viva Voce / Exam Preparation Guide

This document prepares you for a technical defense of the Smart Content Generator project. It covers the "Why" and "How" behind every major architectural decision.

---

## 1. High-Level Architecture
**Q: Can you explain the overall architecture of your system?**
*   **Answer**: It is a **decoupled, event-driven architecture**. Instead of the API server making heavy AI calls directly, it uses a **Producer-Consumer pattern**. The API server (Producer) adds tasks to a **Redis queue (BullMQ)**. A separate Worker process (Consumer) picks up and executes those tasks. We also use **WebSockets** for real-time notifications via a **Redis Pub/Sub bridge**.

**Q: Why did you separate the Worker from the Main API server?**
*   **Answer**: **Scalability and Reliability**. AI processing is time-consuming. If we did it inside the API server, it would block the main thread and slow down other users. By separating it, the API stays responsive. Also, if the API server crashes, the Worker can continue processing, and if the Worker crashes, jobs stay safe in the Redis queue until it restarts.

---

## 2. Queue Implementation (BullMQ & Redis)
**Q: Why did you use Redis/BullMQ instead of just processing it in the background of Express?**
*   **Answer**: Persistence. If the server restarts while an AI call is in progress, a background process in Express would be lost forever. Redis keeps the job data safe. BullMQ also provides features like automatic retries, concurrency control, and delayed execution which are hard to build manually.

**Q: You have a 1-minute delay. How did you implement it?**
*   **Answer**: I used the `delay` option in BullMQ's `queue.add()` method set to `60000` milliseconds. This ensures the job is stored in Redis but not picked up by the worker until the timer expires.

---

## 3. Real-Time Updates (Socket.IO)
**Q: How does the user know when their content is ready?**
*   **Answer**: Two ways:
    1.  **WebSocket (Push)**: We use Socket.IO. When the job finishes, the server pushes the data to the client instantly.
    2.  **Polling (Fallback)**: The client can also check the job status via the `GET /generate-content/:jobId` endpoint.

**Q: The Worker and API are separate processes. How does the Worker tell the API to send a WebSocket message?**
*   **Answer**: Through **Redis Pub/Sub**. The Worker publishes a message to a Redis channel called `job_completed`. The API server is subscribed to that channel. When it receives the message, it finds the user's socket and emits the event. This is a classic pattern for inter-process communication (IPC).

---

## 4. AI & Service Integration
**Q: Why use OpenRouter instead of calling OpenAI directly?**
*   **Answer**: OpenRouter provides a unified interface to multiple LLMs (GPT-4, Claude, Llama). This makes the system "Model Agnostic"—I can switch the underlying AI model just by changing an environment variable without rewriting any code.

**Q: How do you handle AI prompt engineering in this project?**
*   **Answer**: I implemented a **Service Layer** (`src/services/openRouterService.ts`) where I define strict **System Prompts** for each content type (Blog, Social Media, Product). This ensures that even with a short user prompt, the AI knows the specific structure and tone required for that content type.

---

## 5. Security & Data
**Q: How do you secure your WebSocket connection?**
*   **Answer**: I used **Socket.IO Middleware**. Before a connection is accepted, the server validates the JWT token in the handshake. If the token is invalid or missing, the connection is rejected.

**Q: How do you ensure one user cannot see another user's generated content?**
*   **Answer**: Every Job and Content record in MongoDB has a `userId` field. In our controllers, every database query includes `{ userId: req.user.id }`. This ensures a user can only access data they own.

---

## 6. Challenging Scenarios
**Q: What happens if the AI API fails?**
*   **Answer**: The Worker captures the error, updates the job status to `failed` in MongoDB, and stores the error message. BullMQ is also configured with an **exponential backoff retry strategy**, meaning it will try again up to 3 times before finally giving up.

**Q: What if 1,000 users request content at the exact same time?**
*   **Answer**: The system handles this gracefully. The API server will quickly ingest all 1,000 requests into Redis. The Worker is configured with a **concurrency limit** (e.g., 5 jobs at a time). It will process them 5 by 5, ensuring we don't crash our server or hit AI rate limits while keeping every user's request safe in the queue.
