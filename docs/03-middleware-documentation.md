# Middleware Folder - Interview Documentation

## 📁 Folder: `src/middleware`

### Overview
The middleware folder contains cross-cutting concerns that execute before route handlers. Middleware functions have access to request, response, and next function in the application's request-response cycle.

---

## Files Included

### 1. `authMiddleware.ts` - Authentication Middleware
**Purpose**: Protects routes by validating JWT tokens and authenticating users

**Key Concepts to Discuss in Interview**:
- **JWT Authentication**: Validates JSON Web Tokens for protected routes
- **Token Verification**: Decodes and validates token signature and expiration
- **Request Enhancement**: Attaches user data to request object
- **Authorization**: Ensures only authenticated users access protected resources

**Functionality**:
- Extract token from Authorization header
- Verify token using JWT secret
- Decode user information from token payload
- Attach user to request object for downstream use
- Return 401 for invalid/missing tokens

**Interview Questions You Might Face**:
1. **Q: What's the difference between authentication and authorization?**
   - A: Authentication verifies identity (who you are), authorization verifies permissions (what you can do)

2. **Q: Where should you store JWT tokens on the client?**
   - A: httpOnly cookies (best) or localStorage (with XSS considerations). Never in regular cookies without httpOnly

3. **Q: How do you handle token expiration?**
   - A: Implement refresh tokens, return 401 on expiry, client requests new token or redirects to login

4. **Q: What information should you store in a JWT payload?**
   - A: Minimal, non-sensitive data (user ID, role). Never passwords or sensitive PII

5. **Q: How does JWT verification work?**
   - A: Server verifies signature using secret key, checks expiration, validates issuer/audience claims

---

## Middleware Pattern in Express

### Execution Flow
```
Client Request
    ↓
authMiddleware (verify token)
    ↓
Route Handler (if authenticated)
    ↓
Response
```

### Middleware Signature
```typescript
function middleware(req: Request, res: Response, next: NextFunction)
```

---

## Technical Implementation Details

### Token Extraction
```
Authorization: Bearer <token>
```
- Split header by space
- Extract token from "Bearer" scheme
- Handle missing or malformed headers

### Error Handling
- **401 Unauthorized**: Invalid/expired token
- **403 Forbidden**: Valid token but insufficient permissions
- **500 Internal Server Error**: Verification failures

### Security Considerations
- Use strong JWT secrets (environment variables)
- Implement token expiration (e.g., 1h for access tokens)
- Consider refresh token rotation
- Validate token claims (iss, aud, exp)
- Protect against timing attacks

---

## Interview Talking Points

### 1. Middleware Architecture
"Middleware provides a clean separation of concerns. Authentication logic is centralized, reusable, and executed before any business logic, following the Single Responsibility Principle."

### 2. Stateless Authentication
"JWT enables stateless authentication - the server doesn't need to store session data. This improves scalability as any server instance can validate tokens without database lookups."

### 3. Security Best Practices
"I implement token expiration, secure secret management, HTTPS-only transmission, and proper error handling that doesn't leak security information."

### 4. Performance
"JWT verification is fast (cryptographic signature check) and doesn't require database queries, reducing latency for protected routes."

---

## Common Interview Questions

### Q: Why use middleware instead of checking auth in each controller?
**A**: DRY principle, centralized security logic, easier to maintain and test, consistent behavior across routes.

### Q: What happens if next() is not called?
**A**: Request hangs - the chain stops. Always call next() or send a response.

### Q: How do you handle different permission levels?
**A**: Create role-based middleware that checks user.role from token payload, chain multiple middleware functions.

### Q: Can middleware modify the request object?
**A**: Yes! We attach user data to req.user for downstream handlers to use.

---

## Middleware Best Practices Implemented

✅ **Early validation**: Fail fast for invalid requests  
✅ **Type safety**: TypeScript for request/response types  
✅ **Error handling**: Consistent error responses  
✅ **Logging**: Track authentication failures  
✅ **Non-blocking**: Async operations don't block event loop  

---

## Common Mistakes to Avoid (Interview Red Flags)

❌ Storing secrets in code  
❌ Not validating token expiration  
❌ Forgetting to call next()  
❌ Leaking sensitive error messages  
❌ Synchronous blocking operations  

---

## Testing Strategy

### Unit Tests
- Mock JWT verification
- Test token extraction logic
- Test error scenarios (missing, invalid, expired tokens)

### Integration Tests
- Test with real tokens
- Verify protected routes reject unauthorized requests
- Verify authenticated requests reach controllers

---

## Git Commit Strategy
Middleware should be committed after schemas (as it may reference user models) but before routes (which use this middleware).

**Recommended Commit Message**:
```
feat: add JWT authentication middleware

- Implement token verification middleware
- Extract and validate JWT from Authorization header
- Attach authenticated user to request object
- Handle authentication errors with proper status codes
- Add TypeScript types for authenticated requests
```
