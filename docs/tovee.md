# Tovee Content Management API Documentation

> **For Frontend Engineers**: Complete guide to integrating with the Tovee Content Management backend API

## Table of Contents
- [Authentication](#authentication)
- [Base URL](#base-url)
- [Content Endpoints](#content-endpoints)
- [TypeScript Interfaces](#typescript-interfaces)
- [Error Handling](#error-handling)
- [Frontend Integration Examples](#frontend-integration-examples)
- [Common Workflows](#common-workflows)

---

## Authentication

All content endpoints require JWT authentication. You must include the JWT token in the `Authorization` header.

### Getting a Token

**Login Endpoint:**
```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "user@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Important:** Store the `token` value and include it in all subsequent requests:
```
Authorization: Bearer <token>
```

---

## Base URL

```
http://localhost:5000
```

For production, replace with your deployed backend URL.

---

## Content Endpoints

### 1. Get All Contents (with optional search)

Retrieve all content items for the authenticated user. Supports optional search functionality.

**Endpoint:**
```
GET /content
GET /content?search=keyword
```

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Query Parameters:**
| Parameter | Type   | Required | Description                                          |
|-----------|--------|----------|------------------------------------------------------|
| search    | string | No       | Search keyword to filter by title, type, or body     |

**Success Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f191e810c19729de860ea",
    "title": "My First Blog Post",
    "type": "Blog Post Outline",
    "body": "Introduction: Welcome to my blog...",
    "createdAt": "2026-01-13T15:30:00.000Z",
    "updatedAt": "2026-01-13T15:30:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f191e810c19729de860ea",
    "title": "Product Launch Description",
    "type": "Product Description",
    "body": "Introducing our revolutionary new product...",
    "createdAt": "2026-01-13T16:00:00.000Z",
    "updatedAt": "2026-01-13T16:00:00.000Z"
  }
]
```

**Error Response (401):**
```json
{
  "message": "Not authorized, no token"
}
```

**Example Usage:**
```bash
# Get all contents
curl -X GET http://localhost:5000/content \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Search contents
curl -X GET "http://localhost:5000/content?search=blog" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 2. Get Content by ID

Retrieve a specific content item by its ID. Users can only access their own content.

**Endpoint:**
```
GET /content/:id
```

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**URL Parameters:**
| Parameter | Type   | Required | Description              |
|-----------|--------|----------|--------------------------|
| id        | string | Yes      | MongoDB ObjectId of content |

**Success Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "507f191e810c19729de860ea",
  "title": "My First Blog Post",
  "type": "Blog Post Outline",
  "body": "Introduction: Welcome to my blog...",
  "createdAt": "2026-01-13T15:30:00.000Z",
  "updatedAt": "2026-01-13T15:30:00.000Z"
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "message": "Content not found"
}
```

**401 Unauthorized (trying to access another user's content):**
```json
{
  "message": "User not authorized"
}
```

**Example Usage:**
```bash
curl -X GET http://localhost:5000/content/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 3. Create New Content

Create a new content item for the authenticated user.

**Endpoint:**
```
POST /content
```

**Headers:**
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "My Content Title",
  "type": "Blog Post Outline",
  "body": "The full content goes here..."
}
```

**Body Parameters:**
| Parameter | Type   | Required | Description                                                          |
|-----------|--------|----------|----------------------------------------------------------------------|
| title     | string | Yes      | Title of the content                                                 |
| type      | string | Yes      | One of: "Blog Post Outline", "Product Description", "Social Media Caption" |
| body      | string | Yes      | The main content text                                                |

**Success Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "507f191e810c19729de860ea",
  "title": "My Content Title",
  "type": "Blog Post Outline",
  "body": "The full content goes here...",
  "createdAt": "2026-01-13T15:30:00.000Z",
  "updatedAt": "2026-01-13T15:30:00.000Z"
}
```

**Error Responses:**

**400 Bad Request (missing fields):**
```json
{
  "message": "Please provide all fields"
}
```

**400 Bad Request (invalid type):**
```json
{
  "message": "Invalid content type"
}
```

**Example Usage:**
```bash
curl -X POST http://localhost:5000/content \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Summer Product Launch",
    "type": "Product Description",
    "body": "Introducing our amazing new summer collection..."
  }'
```

---

### 4. Update Content

Update an existing content item. Users can only update their own content.

**Endpoint:**
```
PUT /content/:id
```

**Headers:**
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

**URL Parameters:**
| Parameter | Type   | Required | Description              |
|-----------|--------|----------|--------------------------|
| id        | string | Yes      | MongoDB ObjectId of content |

**Request Body:**
```json
{
  "title": "Updated Title",
  "type": "Social Media Caption",
  "body": "Updated content body..."
}
```

> **Note:** You can send partial updates. Only include the fields you want to change.

**Success Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "507f191e810c19729de860ea",
  "title": "Updated Title",
  "type": "Social Media Caption",
  "body": "Updated content body...",
  "createdAt": "2026-01-13T15:30:00.000Z",
  "updatedAt": "2026-01-13T17:00:00.000Z"
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "message": "Content not found"
}
```

**401 Unauthorized (trying to update another user's content):**
```json
{
  "message": "User not authorized"
}
```

**Example Usage:**
```bash
curl -X PUT http://localhost:5000/content/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Summer Product Launch",
    "body": "Our completely redesigned summer collection..."
  }'
```

---

### 5. Delete Content

Delete a content item. Users can only delete their own content.

**Endpoint:**
```
DELETE /content/:id
```

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**URL Parameters:**
| Parameter | Type   | Required | Description              |
|-----------|--------|----------|--------------------------|
| id        | string | Yes      | MongoDB ObjectId of content |

**Success Response (200):**
```json
{
  "id": "507f1f77bcf86cd799439011"
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "message": "Content not found"
}
```

**401 Unauthorized (trying to delete another user's content):**
```json
{
  "message": "User not authorized"
}
```

**Example Usage:**
```bash
curl -X DELETE http://localhost:5000/content/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## TypeScript Interfaces

Use these interfaces in your frontend TypeScript application:

```typescript
// Content type enum
export type ContentType = 
  | 'Blog Post Outline' 
  | 'Product Description' 
  | 'Social Media Caption';

// Content interface
export interface Content {
  _id: string;
  userId: string;
  title: string;
  type: ContentType;
  body: string;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
}

// Create content request
export interface CreateContentRequest {
  title: string;
  type: ContentType;
  body: string;
}

// Update content request (all fields optional)
export interface UpdateContentRequest {
  title?: string;
  type?: ContentType;
  body?: string;
}

// API error response
export interface ApiError {
  message: string;
}

// Auth response
export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  token: string;
}
```

---

## Error Handling

All endpoints follow a consistent error handling pattern:

| Status Code | Meaning           | Common Causes                                  |
|-------------|-------------------|------------------------------------------------|
| 200         | Success           | Request completed successfully                 |
| 201         | Created           | Resource created successfully                  |
| 400         | Bad Request       | Missing required fields or invalid data        |
| 401         | Unauthorized      | Missing/invalid token or accessing others' data|
| 404         | Not Found         | Resource doesn't exist                         |
| 500         | Server Error      | Internal server issue                          |

**Best Practice:** Always check the response status and handle errors appropriately:

```typescript
try {
  const response = await fetch('/content', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  const data = await response.json();
  return data;
} catch (error) {
  console.error('API Error:', error);
  // Handle error appropriately
}
```

---

## Frontend Integration Examples

### React/Next.js with Axios

**1. Setup Axios Instance:**

```typescript
// lib/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

**2. Content Service:**

```typescript
// services/contentService.ts
import api from '@/lib/axios';
import { Content, CreateContentRequest, UpdateContentRequest } from '@/types';

export const contentService = {
  // Get all contents
  getAllContents: async (search?: string): Promise<Content[]> => {
    const url = search ? `/content?search=${encodeURIComponent(search)}` : '/content';
    const { data } = await api.get<Content[]>(url);
    return data;
  },

  // Get content by ID
  getContentById: async (id: string): Promise<Content> => {
    const { data } = await api.get<Content>(`/content/${id}`);
    return data;
  },

  // Create new content
  createContent: async (content: CreateContentRequest): Promise<Content> => {
    const { data } = await api.post<Content>('/content', content);
    return data;
  },

  // Update content
  updateContent: async (id: string, updates: UpdateContentRequest): Promise<Content> => {
    const { data } = await api.put<Content>(`/content/${id}`, updates);
    return data;
  },

  // Delete content
  deleteContent: async (id: string): Promise<void> => {
    await api.delete(`/content/${id}`);
  },
};
```

**3. React Component Example:**

```typescript
// components/ContentList.tsx
import { useState, useEffect } from 'react';
import { contentService } from '@/services/contentService';
import { Content } from '@/types';

export default function ContentList() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadContents();
  }, [search]);

  const loadContents = async () => {
    try {
      setLoading(true);
      const data = await contentService.getAllContents(search);
      setContents(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load contents');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;
    
    try {
      await contentService.deleteContent(id);
      setContents(contents.filter(c => c._id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete content');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <input
        type="text"
        placeholder="Search contents..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      
      {contents.map((content) => (
        <div key={content._id}>
          <h3>{content.title}</h3>
          <p>{content.type}</p>
          <p>{content.body.substring(0, 100)}...</p>
          <button onClick={() => handleDelete(content._id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

**4. Create/Update Form Example:**

```typescript
// components/ContentForm.tsx
import { useState } from 'react';
import { contentService } from '@/services/contentService';
import { ContentType } from '@/types';

interface Props {
  contentId?: string;
  initialData?: {
    title: string;
    type: ContentType;
    body: string;
  };
  onSuccess?: () => void;
}

export default function ContentForm({ contentId, initialData, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    type: initialData?.type || 'Blog Post Outline' as ContentType,
    body: initialData?.body || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (contentId) {
        // Update existing content
        await contentService.updateContent(contentId, formData);
      } else {
        // Create new content
        await contentService.createContent(formData);
      }
      onSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save content');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      
      <input
        type="text"
        placeholder="Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
      />

      <select
        value={formData.type}
        onChange={(e) => setFormData({ ...formData, type: e.target.value as ContentType })}
        required
      >
        <option value="Blog Post Outline">Blog Post Outline</option>
        <option value="Product Description">Product Description</option>
        <option value="Social Media Caption">Social Media Caption</option>
      </select>

      <textarea
        placeholder="Content body"
        value={formData.body}
        onChange={(e) => setFormData({ ...formData, body: e.target.value })}
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Saving...' : contentId ? 'Update' : 'Create'}
      </button>
    </form>
  );
}
```

---

## Common Workflows

### 1. Initial Page Load - Fetch All Contents

```typescript
// On component mount, fetch all contents for the library/dashboard
const contents = await contentService.getAllContents();
```

### 2. Search Functionality

```typescript
// User types in search box, debounce and search
const handleSearch = debounce(async (searchTerm: string) => {
  const results = await contentService.getAllContents(searchTerm);
  setContents(results);
}, 300);
```

### 3. Create New Content (from AI Generation)

```typescript
// After AI generates content, save it to library
const newContent = await contentService.createContent({
  title: aiGeneratedTitle,
  type: selectedType,
  body: aiGeneratedBody,
});
```

### 4. Edit Existing Content

```typescript
// User clicks edit button
const content = await contentService.getContentById(contentId);

// Display in form, then on save:
await contentService.updateContent(contentId, {
  title: updatedTitle,
  body: updatedBody,
});
```

### 5. Delete Content

```typescript
// User clicks delete button
if (confirm('Delete this content?')) {
  await contentService.deleteContent(contentId);
  // Remove from local state
  setContents(contents.filter(c => c._id !== contentId));
}
```

---

## Testing with cURL

Quick reference for testing API endpoints with cURL:

```bash
# 1. Login and get token
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# 2. Create content
curl -X POST http://localhost:5000/content \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","type":"Blog Post Outline","body":"Content here"}'

# 3. Get all contents
curl -X GET http://localhost:5000/content \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Get content by ID
curl -X GET http://localhost:5000/content/CONTENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# 5. Update content
curl -X PUT http://localhost:5000/content/CONTENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title"}'

# 6. Delete content
curl -X DELETE http://localhost:5000/content/CONTENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# 7. Search contents
curl -X GET "http://localhost:5000/content?search=blog" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Important Notes

> [!IMPORTANT]
> **Authorization**: All endpoints verify that the authenticated user owns the content they're trying to access/modify. You cannot access or modify other users' content.

> [!WARNING]
> **Content Types**: Only three content types are allowed: "Blog Post Outline", "Product Description", and "Social Media Caption". Using any other type will result in a 400 error.

> [!TIP]
> **Token Storage**: Store JWT tokens securely (e.g., httpOnly cookies in production, localStorage for development). Remember to clear tokens on logout.

> [!NOTE]
> **Timestamps**: All content items automatically include `createdAt` and `updatedAt` timestamps. These are managed by MongoDB and cannot be manually set.

---

## Support

For backend issues or questions:
- Check backend logs in the terminal
- Verify MongoDB connection
- Ensure Redis is running (for job queue)
- Confirm environment variables are set correctly in `.env`

For more detailed architecture information, see:
- [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)
- [FRONTEND_API_REFERENCE.md](./FRONTEND_API_REFERENCE.md)
