# Schemas Folder - Interview Documentation

## 📁 Folder: `src/schemas`

### Overview
The schemas folder defines the data models and structure for the application using Mongoose ODM. These schemas represent the core entities in the system and their relationships.

---

## Files Included

### 1. `userSchema.ts` - User Model
**Purpose**: Defines user authentication and profile data structure

**Key Concepts to Discuss in Interview**:
- **User Authentication**: Stores user credentials securely
- **Password Hashing**: Uses bcrypt for secure password storage
- **JWT Tokens**: Supports token-based authentication
- **Schema Validation**: Enforces data integrity at the database level

**Schema Fields**:
- Email (unique, required)
- Password (hashed, required)
- Name/Profile information
- Timestamps (createdAt, updatedAt)

**Interview Questions You Might Face**:
1. **Q: How do you secure user passwords?**
   - A: Use bcrypt with salt rounds (10-12), never store plain text, implement password strength validation

2. **Q: Why make email unique at the schema level?**
   - A: Prevents duplicate accounts, ensures data integrity, creates database index for fast lookups

3. **Q: How do you handle password updates?**
   - A: Use Mongoose pre-save hooks to detect password changes and re-hash before saving

---

### 2. `contentSchema.ts` - Content Model
**Purpose**: Stores AI-generated content with metadata

**Key Concepts to Discuss in Interview**:
- **Content Management**: Organizes generated content per user
- **Ownership**: Links content to users via references
- **Metadata Storage**: Tracks generation parameters and status
- **Timestamps**: Audit trail for content creation

**Schema Fields**:
- User reference (ObjectId)
- Title
- Generated content/text
- Content type/category
- Generation parameters
- Status/visibility flags
- Timestamps

**Interview Questions You Might Face**:
1. **Q: How do you handle user-content relationships?**
   - A: Use Mongoose population with ObjectId references, enables efficient queries and maintains referential integrity

2. **Q: What indexing strategies did you use?**
   - A: Index userId for fast user-based queries, add compound indexes for common query patterns

3. **Q: How do you handle content deletion when a user is deleted?**
   - A: Implement cascade deletion using Mongoose middleware hooks or database triggers

---

### 3. `jobSchema.ts` - Job Queue Model
**Purpose**: Tracks AI generation jobs and their lifecycle

**Key Concepts to Discuss in Interview**:
- **Job Tracking**: Monitors async job status and progress
- **State Machine**: Manages job states (pending, processing, completed, failed)
- **Result Storage**: Stores generation results and error messages
- **Retry Logic**: Tracks retry attempts and failures

**Schema Fields**:
- User reference (ObjectId)
- Job ID (from BullMQ)
- Prompt/Input parameters
- Status (pending/processing/completed/failed)
- Result/Output
- Error messages
- Retry count
- Timestamps

**Interview Questions You Might Face**:
1. **Q: Why store job data in MongoDB when BullMQ has its own storage?**
   - A: Long-term persistence, historical tracking, user-facing queries, and analytics beyond queue TTL

2. **Q: How do you prevent duplicate job submissions?**
   - A: Check existing pending jobs before creating new ones, use unique constraints on job identifiers

3. **Q: How do you handle failed jobs?**
   - A: Implement exponential backoff, max retry limits, error logging, and user notifications

4. **Q: What's the relationship between BullMQ jobs and this schema?**
   - A: BullMQ handles execution; this schema tracks the business logic state and provides user-facing status

---

## Technical Architecture Decisions

### Mongoose Features Used
- **Schema Validation**: Built-in type checking and custom validators
- **Middleware Hooks**: Pre/post save hooks for business logic
- **Virtual Fields**: Computed properties not stored in DB
- **Population**: Reference resolution for relationships
- **Indexing**: Performance optimization for queries

### Design Patterns
- **Repository Pattern**: Schemas as data access layer
- **Domain Modeling**: Schemas represent business entities
- **Separation of Concerns**: Data structure separate from business logic

---

## Interview Talking Points

### 1. Data Modeling Strategy
"I designed the schemas following MongoDB best practices: embedded documents for one-to-few relationships, references for one-to-many, and denormalization where read performance is critical."

### 2. Schema Evolution
"Mongoose allows schema versioning and migrations. I'd use migration scripts for breaking changes and default values for backward compatibility."

### 3. Validation Strategy
"Multi-layered validation: schema-level for structure, custom validators for business rules, and application-level for complex logic."

### 4. Performance Optimization
"Strategic indexing on frequently queried fields, lean queries for read-only operations, and projection to limit returned fields."

---

## Database Relationships

```
User (1) ──── (Many) Content
  │
  └──── (Many) Jobs
```

---

## Common Mistakes to Avoid (Interview Red Flags)
❌ Not indexing foreign keys  
❌ Over-normalizing MongoDB (it's not SQL)  
❌ Storing sensitive data without encryption  
❌ Missing validation on required fields  
❌ Not using timestamps for audit trails  

## Best Practices Implemented
✅ Proper indexing strategy  
✅ Schema validation and constraints  
✅ Timestamp tracking (createdAt, updatedAt)  
✅ Reference-based relationships  
✅ Field-level security (password hashing)  

---

## Git Commit Strategy
Schemas should be committed after config (they depend on database connection) but before controllers (which use these models).

**Recommended Commit Message**:
```
feat: implement MongoDB schemas for core entities

- Add User schema with authentication support
- Add Content schema for AI-generated content management
- Add Job schema for async job tracking
- Implement proper validation and indexing
- Add relationships between User, Content, and Jobs
```
