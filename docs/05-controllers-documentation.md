# Controllers Folder - Interview Documentation

## 📁 Folder: `src/controllers`

### Overview
Controllers handle HTTP requests and responses. They orchestrate the flow between client requests, business logic (services), and data layer (models). Controllers are the entry point for REST API operations.

---

## Files Included

### 1. `authController.ts` - Authentication Controller
**Purpose**: Handles user authentication operations (register, login)

**Key Responsibilities**:
- User registration with validation
- User login with credential verification
- JWT token generation
- Password hashing and verification
- Input validation and sanitization

**Endpoints**:
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate user and return token

**Interview Questions You Might Face**:

1. **Q: How do you prevent duplicate user registrations?**
   - A: Unique constraint on email in schema, check existing user before creation, return appropriate error (409 Conflict)

2. **Q: How do you secure passwords?**
   - A: Bcrypt hashing with salt (10-12 rounds), never store plain text, use Mongoose pre-save hooks for automatic hashing

3. **Q: What data do you return after successful login?**
   - A: JWT token, user info (without password), token expiration time

4. **Q: How do you validate user input?**
   - A: Multi-layer validation: request validation middleware (express-validator), schema validation (Mongoose), business logic validation in controller

---

### 2. `contentController.ts` - Content Management Controller
**Purpose**: CRUD operations for AI-generated content

**Key Responsibilities**:
- Fetch user's content library
- Retrieve single content item
- Update content (title, text)
- Delete content
- Filter and search content

**Endpoints**:
- `GET /api/content` - Get all user's content (with pagination)
- `GET /api/content/:id` - Get specific content item
- `PUT /api/content/:id` - Update content
- `DELETE /api/content/:id` - Delete content

**Interview Questions You Might Face**:

1. **Q: How do you ensure users can only access their own content?**
   - A: Filter queries by authenticated user ID (from authMiddleware), validate ownership before update/delete

2. **Q: How do you implement pagination?**
   - A: Use skip/limit with Mongoose, return total count, current page, page size, and total pages

3. **Q: What's the difference between PUT and PATCH?**
   - A: PUT replaces entire resource, PATCH updates specific fields. Use PATCH for partial updates

4. **Q: How do you handle "content not found" scenarios?**
   - A: Return 404 with descriptive message, log attempts to access non-existent resources

---

### 3. `generateController.ts` - AI Generation Controller
**Purpose**: Handles AI content generation requests and job management

**Key Responsibilities**:
- Queue AI generation jobs
- Return immediate job ID (async pattern)
- Check job status
- Retrieve job results
- Save generated content to library
- Handle generation errors

**Endpoints**:
- `POST /api/generate` - Submit generation job
- `GET /api/generate/status/:jobId` - Poll job status
- `POST /api/generate/save/:jobId` - Save result to content library

**Interview Questions You Might Face**:

1. **Q: Why use a queue instead of synchronous generation?**
   - A: AI generation takes time (30s-2min), prevents request timeout, improves UX with async feedback, enables horizontal scaling

2. **Q: How does the client know when generation is complete?**
   - A: Polling (GET /status/:jobId) or WebSocket push notifications. Return jobId immediately, client polls until status changes

3. **Q: What happens if job processing fails?**
   - A: BullMQ retries with exponential backoff, update job status to 'failed', store error message, notify user

4. **Q: How do you prevent duplicate job submissions?**
   - A: Generate job ID based on user ID + prompt hash, check for existing pending jobs, implement debouncing on client

5. **Q: Explain the complete flow from request to saved content**
   - A:
     1. Client POST /api/generate with prompt
     2. Controller validates input, adds job to BullMQ queue
     3. Returns jobId immediately (202 Accepted)
     4. Worker picks up job after delay (1 minute)
     5. Worker calls OpenRouter AI service
     6. Worker updates job schema with result
     7. Client polls /status/:jobId, gets result when complete
     8. Client POST /save/:jobId to persist to content library

---

## Controller Architecture

### Request-Response Flow
```
Client Request
    ↓
Express Router
    ↓
Middleware (auth, validation)
    ↓
Controller (orchestration)
    ↓
Service (business logic)
    ↓
Model (data layer)
    ↓
Controller (format response)
    ↓
Client Response
```

### Responsibilities (MVC Pattern)
- **Model**: Data structure and database operations
- **View**: JSON API responses (no templates in REST API)
- **Controller**: Request handling, orchestration, response formatting

---

## HTTP Status Codes Used

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET, PUT |
| 201 | Created | Successful POST (new resource) |
| 202 | Accepted | Async job queued |
| 400 | Bad Request | Invalid input, validation errors |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource (e.g., email exists) |
| 500 | Internal Server Error | Unexpected server errors |

---

## Interview Talking Points

### 1. Controller Design Philosophy
"Controllers are thin orchestrators - they validate input, call services for business logic, and format responses. This keeps them focused on HTTP concerns while business logic lives in services."

### 2. Error Handling Strategy
"Consistent error responses with proper status codes, user-friendly messages, and logged technical details. Never expose internal errors or stack traces to clients."

### 3. Async Job Pattern
"For long-running operations, we return immediately with a job ID rather than making clients wait. This improves perceived performance and prevents timeout issues."

### 4. RESTful API Design
"Following REST principles: resource-based URLs, appropriate HTTP verbs, stateless requests, standard status codes, and consistent response formats."

---

## Common Interview Questions

### Q: How do you handle validation errors?
**A**: Use express-validator middleware, return 400 with field-specific errors, validate at multiple layers (request, schema, business logic).

### Q: What's the difference between 401 and 403?
**A**: 401 = not authenticated (no/invalid token), 403 = authenticated but not authorized (valid user, insufficient permissions).

### Q: How do you structure controller methods?
**A**: Async/await, try-catch for errors, validate input, call services, format response, return appropriate status code.

### Q: How would you implement rate limiting?
**A**: Use express-rate-limit middleware, Redis for distributed rate limiting, per-user or per-IP limits, return 429 Too Many Requests.

---

## Best Practices Implemented

✅ **Async/await**: Non-blocking operations  
✅ **Error handling**: Try-catch with proper logging  
✅ **Status codes**: Semantic HTTP codes  
✅ **Separation of concerns**: Thin controllers  
✅ **Authentication**: Protected routes with middleware  
✅ **Validation**: Input validation before processing  
✅ **Resource filtering**: Users can only access their data  

---

## Common Mistakes to Avoid (Interview Red Flags)

❌ Business logic in controllers  
❌ Not handling async errors  
❌ Using wrong HTTP status codes  
❌ Not validating user input  
❌ Exposing internal error details  
❌ Missing authorization checks  
❌ Blocking the event loop  

---

## Testing Strategy

### Unit Tests
- Mock services and models
- Test request validation
- Test error handling
- Test response formatting

### Integration Tests
- Real database (test DB)
- End-to-end request flow
- Authentication scenarios
- Error scenarios

---

## Git Commit Strategy
Controllers should be committed after services and middleware (which they depend on) but before routes (which reference controllers).

**Recommended Commit Message**:
```
feat: implement REST API controllers

- Add authentication controller (register, login)
- Add content controller (CRUD operations)
- Add generation controller (async AI job management)
- Implement proper error handling and status codes
- Add input validation and authorization checks
- Follow RESTful API design principles
```
