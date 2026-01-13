# Configuration Folder - Interview Documentation

## 📁 Folder: `src/config`

### Overview
The configuration folder contains critical infrastructure setup files that establish connections to external services. This folder is the foundation of the application's data persistence and job queue management.

---

## Files Included

### 1. `db.ts` - Database Configuration
**Purpose**: Establishes MongoDB connection for data persistence

**Key Concepts to Discuss in Interview**:
- **MongoDB Connection**: Handles connection to MongoDB database using Mongoose ODM
- **Connection String**: Uses environment variables for secure credential management
- **Error Handling**: Implements proper connection error handling and logging
- **Async Operations**: Uses async/await pattern for database initialization

**Interview Questions You Might Face**:
1. **Q: Why use Mongoose instead of native MongoDB driver?**
   - A: Mongoose provides schema validation, type casting, query building, and business logic hooks (middleware)

2. **Q: How do you handle database connection failures?**
   - A: Implement retry logic, error logging, graceful degradation, and health checks

3. **Q: What's the purpose of connection pooling?**
   - A: Reuses database connections to improve performance and reduce overhead

---

### 2. `queue.ts` - Queue Configuration
**Purpose**: Sets up BullMQ for asynchronous job processing with Redis

**Key Concepts to Discuss in Interview**:
- **Job Queue Pattern**: Decouples request handling from time-consuming operations
- **BullMQ**: Advanced job queue system built on Redis
- **Redis Integration**: Uses Redis as the backing store for queue persistence
- **Worker Separation**: Separates job enqueueing from job processing

**Interview Questions You Might Face**:
1. **Q: Why use a job queue instead of processing requests synchronously?**
   - A: Improves response times, handles load spikes, enables retry logic, and prevents timeout issues

2. **Q: What happens if Redis goes down?**
   - A: Jobs in memory are lost; implement persistent Redis with AOF/RDB, monitoring, and failover strategies

3. **Q: How does BullMQ differ from other queue systems?**
   - A: BullMQ offers: priority queues, delayed jobs, rate limiting, job retries, and monitoring features

4. **Q: What are the benefits of separating the worker process?**
   - A: Scalability (can run multiple workers), isolation (crashes don't affect API), and resource management

---

## Technical Architecture Decisions

### Environment Variables Used
```
MONGODB_URI - MongoDB connection string
REDIS_HOST - Redis server host
REDIS_PORT - Redis server port
REDIS_PASSWORD - Redis authentication
```

### Design Patterns
- **Singleton Pattern**: Single database connection instance
- **Factory Pattern**: Queue creation and management
- **Configuration as Code**: Centralized configuration management

---

## Interview Talking Points

### 1. Scalability
"The configuration is designed for horizontal scaling. The queue system allows us to add more worker processes, and MongoDB supports sharding for data distribution."

### 2. Reliability
"We use Redis for queue persistence and MongoDB for data persistence. Both support clustering and replication for high availability."

### 3. Security
"All credentials are externalized via environment variables, never hardcoded. We use connection encryption for production environments."

### 4. Monitoring
"Both Redis and MongoDB connections can be monitored for health checks, and BullMQ provides built-in job monitoring and metrics."

---

## Common Mistakes to Avoid (Interview Red Flags)
❌ Hardcoding connection strings  
❌ Not handling connection errors  
❌ Blocking the event loop during connection  
❌ Not closing connections on shutdown  
❌ Missing connection timeout configurations  

## Best Practices Implemented
✅ Environment-based configuration  
✅ Async/await for non-blocking operations  
✅ Centralized error handling  
✅ Connection reuse and pooling  
✅ Graceful degradation strategies  

---

## Git Commit Strategy
This folder should be committed early as it's a prerequisite for other modules (models, services, workers).

**Recommended Commit Message**:
```
feat: add database and queue configuration

- Configure MongoDB connection with Mongoose
- Set up BullMQ with Redis for job queue management
- Implement environment-based configuration
- Add error handling and logging for connections
```
