# Auth Controller Documentation

This documentation details the API endpoints handled by `authController.js`.
Base URL: `/user`

## 1. Register User

Register a new user, hash their password, and return an authentication token.

- **URL**: `/register`
- **Method**: `POST`
- **Auth Required**: No

### Request Body

| Field    | Type   | Required | Description                  |
| :------- | :----- | :------- | :--------------------------- |
| name     | String | Yes      | Full name of the user        |
| email    | String | Yes      | User's email address         |
| password | String | Yes      | User's password (unhashed)   |

**Example Request:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

### Success Response

- **Code**: `201 Created`
- **Content**:

```json
{
  "_id": "60d0fe4f5311236168a109ca",
  "name": "John Doe",
  "email": "john@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Error Responses

- **Code**: `400 Bad Request`
  - **Reason**: Missing fields.
  - **Content**: `{ "message": "Please provide all fields" }`

- **Code**: `400 Bad Request`
  - **Reason**: User already exists.
  - **Content**: `{ "message": "User already exists" }`

- **Code**: `500 Server Error`
  - **Reason**: internal server error.
  - **Content**: `{ "message": "Server error" }`

---

## 2. Login User

Authenticate a user and return an authentication token.

- **URL**: `/login`
- **Method**: `POST`
- **Auth Required**: No

### Request Body

| Field    | Type   | Required | Description                  |
| :------- | :----- | :------- | :--------------------------- |
| email    | String | Yes      | User's email address         |
| password | String | Yes      | User's password              |

**Example Request:**

```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

### Success Response

- **Code**: `200 OK`
- **Content**:

```json
{
  "_id": "60d0fe4f5311236168a109ca",
  "name": "John Doe",
  "email": "john@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Error Responses

- **Code**: `401 Unauthorized`
  - **Reason**: Invalid email or password.
  - **Content**: `{ "message": "Invalid credentials" }`

- **Code**: `500 Server Error`
  - **Reason**: internal server error.
  - **Content**: `{ "message": "Server error" }`

---

## 3. Get Current User (Me)

Retrieve the currently authenticated user's information.

- **URL**: `/me`
- **Method**: `GET`
- **Auth Required**: Yes

### Headers

| Header        | Value            | Description                               |
| :------------ | :--------------- | :---------------------------------------- |
| Authorization | `Bearer <token>` | JWT token received from login/register    |

### Request Parameters

None

### Success Response

- **Code**: `200 OK`
- **Content**: (Returns the full user object, content may vary based on `req.user` population in middleware)

```json
{
  "_id": "60d0fe4f5311236168a109ca",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2021-06-21T10:00:00.000Z",
  "updatedAt": "2021-06-21T10:00:00.000Z",
  "__v": 0
}
```

### Error Responses

- **Code**: `401 Unauthorized` (Handled by middleware)
  - **Reason**: Missing or invalid token.

- **Code**: `500 Server Error` (If controller fails unexpectedly)
