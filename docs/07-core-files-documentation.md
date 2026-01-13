# Core Files - Interview Documentation

## 📁 Core Application Files

### Overview
Main application entry points that bootstrap the application, configure the server, and handle background job processing.

---

## Files Included

### 1. `app.ts` - Express Application Setup
**Purpose**: Main Express application configuration and middleware setup

**Middleware Stack**:
1. CORS - Cross-Origin Resource Sharing
2. Body Parser - Parse JSON requests
3. Morgan - HTTP logging
4. Custom Middleware - Auth, error handling

**Interview Questions**:

**Q: What is CORS and why needed?**
A: Allows frontend (different domain) to access backend. Browsers block cross-origin requests by default.

**Q: What's middleware order?**
A: Top to bottom as registered. Body parser before routes, error handler at end.

---

### 2. `worker.ts` - Background Job Processor
**Purpose**: Separate process for async AI generation

**Responsibilities**:
- Process delayed jobs (1-minute delay)
- Call AI API
- Update job status
- Handle retries

**Interview Questions**:

**Q: Why separate worker from API server?**
A: Isolation, scalability, resource management, deployment flexibility.

**Q: How do workers scale?**
A: Run multiple worker processes, each connects to same Redis queue.

**Q: Job lifecycle?**
A:
1. API adds job (pending)
2. Worker picks up after delay (active)
3. Worker processes (processing)
4. Updates status (completed/failed)
5. Retry if failed

---

### 3. `types.d.ts` - TypeScript Definitions
**Purpose**: Custom type definitions and interface extensions

**Use Cases**:
- Extend Express Request
- Add req.user type
- Shared types

---

## Architecture

### Two-Process Design

**API Server** (app.ts):
- HTTP requests
- Fast responses
- Horizontally scalable

**Worker** (worker.ts):
- Background jobs
- Long-running tasks
- Independently scalable

---

## Git Commit Strategy

**Recommended Message**:
```
feat: add core application and worker process

- Configure Express app with middleware
- Set up CORS, body parser, logging
- Register API routes
- Implement worker for async jobs
- Add TypeScript definitions
```
