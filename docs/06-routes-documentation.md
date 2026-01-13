# Routes Folder - Interview Documentation

## 📁 Folder: `src/routes`

### Overview
Routes define the API endpoints and connect HTTP requests to controllers. They specify URL patterns, HTTP methods, middleware chains, and map them to controller functions. Routes are the public interface of your REST API.

---

## Files Included

### 1. `userRoutes.ts` - Authentication Routes
**Purpose**: Define endpoints for user authentication operations

**Endpoints Defined**:
- `POST /api/auth/register` → Register new user
- `POST /api/auth/login` → User login

**Key Concepts**:
- **Public routes**: No authentication required
- **Input validation**: Validate email/password format
- **Route grouping**: All auth routes under `/auth` prefix

**Interview Questions You Might Face**:

1. **Q: Why separate routes from controllers?**
   - A: Separation of concerns, easier to understand API structure, route configuration separate from business logic, easier to document API

2. **Q: What's the Express Router?**
   - A: Mini-application for routing, allows modular route handlers, can apply middleware to specific route groups

3. **Q: Should authentication routes be public or protected?**
   - A: Public (register/login) - they create the auth token. Logout/profile routes would be protected

---

### 2. `contentRoutes.ts` - Content Management Routes
**Purpose**: Define endpoints for content CRUD operations

**Endpoints Defined**:
- `GET /api/content` → List all user's content
- `GET /api/content/:id` → Get specific content
- `PUT /api/content/:id` → Update content
- `DELETE /api/content/:id` → Delete content

**Key Concepts**:
- **Protected routes**: All require authentication
- **RESTful design**: Resource-based URLs with HTTP verbs
- **Route parameters**: Dynamic :id for resource identification
- **Middleware chain**: auth → controller

**Interview Questions You Might Face**:

1. **Q: How do you protect all routes in a router?**
   - A: Apply middleware to the router: `router.use(authMiddleware)` or individual routes

2. **Q: What's the difference between route params (:id) and query strings (?page=1)?**
   - A: Params identify resources, query strings filter/paginate. Params are required, query strings optional

3. **Q: Why use different HTTP methods instead of all POST?**
   - A: RESTful semantics, proper HTTP caching, idempotency guarantees (GET/PUT safe, POST not)

---

### 3. `generateRoutes.ts` - AI Generation Routes
**Purpose**: Define endpoints for AI content generation workflow

**Endpoints Defined**:
- `POST /api/generate` → Submit generation job
- `GET /api/generate/status/:jobId` → Check job status
- `POST /api/generate/save/:jobId` → Save generated content

**Key Concepts**:
- **Protected routes**: Require authentication
- **Async pattern**: Separate endpoints for submit/status/save
- **Job tracking**: JobId-based operations
- **Nested resources**: Job status under /generate/:jobId

**Interview Questions You Might Face**:

1. **Q: Why have separate endpoints for status and save?**
   - A: Separation of concerns, status for polling/monitoring, save for explicit user action, flexibility in workflow

2. **Q: How would you handle API versioning?**
   - A: Prefix routes: /api/v1/generate, /api/v2/generate, maintain multiple versions during transition

3. **Q: What's the benefit of route grouping?**
   - A: Apply common middleware, organize related endpoints, easier documentation, clear API structure

---

## Route Architecture

### REST API Structure
```
/api
  /auth
    POST /register
    POST /login
  /content
    GET    /         (list all)
    GET    /:id      (get one)
    PUT    /:id      (update)
    DELETE /:id      (delete)
  /generate
    POST   /         (create job)
    GET    /status/:jobId
    POST   /save/:jobId
```

### HTTP Method Semantics

| Method | Purpose | Idempotent | Safe |
|--------|---------|------------|------|
| GET | Retrieve resource | Yes | Yes |
| POST | Create resource | No | No |
| PUT | Update/replace | Yes | No |
| DELETE | Remove resource | Yes | No |
| PATCH | Partial update | No | No |

**Safe**: No side effects, read-only  
**Idempotent**: Same request multiple times = same result

---

## Route Middleware Chain

```
Request
  ↓
1. Express built-in middleware (body-parser, cors)
  ↓
2. Route-specific middleware (authMiddleware)
  ↓
3. Validation middleware (express-validator)
  ↓
4. Controller function
  ↓
Response
```

---

## Interview Talking Points

### 1. RESTful API Design
"I follow REST principles: resource-based URLs (/content not /getContent), appropriate HTTP verbs (GET for retrieve, POST for create), stateless requests, and standard status codes. This makes the API intuitive and follows industry standards."

### 2. Route Organization
"Routes are organized by resource domain (user, content, generate). Each router is a module that can be tested independently and mounted at different base paths. This promotes modularity and maintainability."

### 3. Middleware Strategy
"Authentication is applied at the route level - public routes (register/login) don't have authMiddleware, protected routes do. This makes the security model explicit and easy to audit."

### 4. URL Design Best Practices
"I use nouns for resources (/content), not verbs (/getContent). Actions are expressed through HTTP methods. Route parameters identify specific resources, query strings filter collections."

---

## Common Interview Questions

### Q: How do you document your API?
**A**: OpenAPI/Swagger specification generated from routes, Postman collections, markdown documentation, inline JSDoc comments on routes.

### Q: How would you implement API versioning?
**A**: URL versioning (/api/v1), header versioning (Accept: application/vnd.api+json; version=1), or query parameter (?version=1). URL is most explicit.

### Q: What's the difference between app.use() and router.use()?
**A**: app.use() applies to entire app, router.use() applies to routes in that router. Router is modular subset of app.

### Q: How do you handle CORS in routes?
**A**: Configure CORS middleware at app level or specific routes, specify allowed origins, methods, headers, credentials.

### Q: What are route prefixes and why use them?
**A**: Mounted path when registering router (app.use('/api/content', contentRoutes)). Provides namespace, enables versioning, groups related endpoints.

---

## API Documentation Example

```markdown
### Authentication API

#### Register User
POST /api/auth/register
Body: { email, password, name }
Response: { user, token }
Status: 201 Created

#### Login User  
POST /api/auth/login
Body: { email, password }
Response: { user, token }
Status: 200 OK
```

---

## Best Practices Implemented

✅ **RESTful URLs**: Resource-based, not action-based  
✅ **Proper HTTP methods**: GET/POST/PUT/DELETE semantics  
✅ **Route grouping**: Related endpoints in same router  
✅ **Middleware composition**: Auth applied to protected routes  
✅ **Modular structure**: Each resource has own router  
✅ **Clear naming**: Descriptive route paths  

---

## Common Mistakes to Avoid (Interview Red Flags)

❌ Using verbs in URLs (/getUser, /createPost)  
❌ Using wrong HTTP methods (GET for mutations)  
❌ Not protecting sensitive routes  
❌ Inconsistent URL patterns  
❌ Deeply nested routes (keep flat when possible)  
❌ Exposing internal implementation in URLs  

---

## Testing Strategy

### Route Testing
- Test route registration
- Test middleware application
- Test URL pattern matching
- Test parameter extraction

### Integration Testing
- Full request-response cycle
- Authentication flow
- Error handling
- Status codes

---

## Security Considerations

### Protected Routes
- Apply authMiddleware to all routes accessing user data
- Validate ownership (user can only access their resources)
- Rate limiting for sensitive operations

### Input Validation
- Validate route parameters
- Sanitize query strings
- Use express-validator for request validation

---

## Git Commit Strategy
Routes should be committed last (or near last) as they depend on controllers, middleware, and schemas. They represent the complete API surface.

**Recommended Commit Message**:
```
feat: define REST API routes and endpoints

- Add authentication routes (register, login)
- Add content management routes (CRUD operations)
- Add AI generation routes (async job workflow)
- Apply authentication middleware to protected routes
- Follow RESTful API design principles
- Organize routes by resource domain
```
