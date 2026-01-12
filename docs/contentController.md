# Content Controller Documentation

This documentation details the API endpoints handled by `contentController.js`.
Base URL: `/content`

## 1. Get All Contents

Retrieve a list of contents for the authenticated user. Supports searching by keyword.

- **URL**: `/`
- **Method**: `GET`
- **Auth Required**: Yes

### Request Parameters (Query)

| Field    | Type   | Required | Description                                    |
| :------- | :----- | :------- | :--------------------------------------------- |
| search   | String | No       | Keyword to search in title, type, or body      |

### Success Response

- **Code**: `200 OK`
- **Content**: Array of content objects.

```json
[
  {
    "_id": "60d0fe4f5311236168a109cb",
    "userId": "60d0fe4f5311236168a109ca",
    "title": "My First Blog Post",
    "type": "Blog Post Outline",
    "body": "Introduction... Body... Conclusion...",
    "createdAt": "2021-06-21T10:00:00.000Z",
    "updatedAt": "2021-06-21T10:00:00.000Z",
    "__v": 0
  }
]
```

---

## 2. Create Content

Create a new piece of content.

- **URL**: `/`
- **Method**: `POST`
- **Auth Required**: Yes

### Request Body

| Field | Type   | Required | Description                                                                 |
| :---- | :----- | :------- | :-------------------------------------------------------------------------- |
| title | String | Yes      | Title of the content                                                        |
| type  | String | Yes      | Type of content ('Blog Post Outline', 'Product Description', 'Social Media Caption') |
| body  | String | Yes      | The actual content text                                                     |

**Example Request:**

```json
{
  "title": "Summer Campaign",
  "type": "Social Media Caption",
  "body": "Enjoy the sun! #summer #vibes"
}
```

### Success Response

- **Code**: `201 Created`
- **Content**: The created content object.

### Error Responses

- **Code**: `400 Bad Request`
  - **Reason**: Missing fields or invalid type.
  - **Content**: `{ "message": "Please provide all fields" }` or `{ "message": "Invalid content type" }`

---

## 3. Update Content

Update an existing piece of content.

- **URL**: `/:id`
- **Method**: `PUT`
- **Auth Required**: Yes

### Request Body

(Any of the fields from Create Content can be updated)

| Field | Type   | Required | Description          |
| :---- | :----- | :------- | :------------------- |
| title | String | No       | New title            |
| type  | String | No       | New type             |
| body  | String | No       | New content body     |

### Success Response

- **Code**: `200 OK`
- **Content**: The updated content object.

### Error Responses

- **Code**: `404 Not Found`
  - **Reason**: Content ID not found.
  - **Content**: `{ "message": "Content not found" }`

- **Code**: `401 Unauthorized`
  - **Reason**: User tries to update someone else's content.
  - **Content**: `{ "message": "User not authorized" }`

---

## 4. Delete Content

Delete an existing piece of content.

- **URL**: `/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes

### Success Response

- **Code**: `200 OK`
- **Content**: `{ "id": "60d0fe4f5311236168a109cb" }`

### Error Responses

- **Code**: `404 Not Found`
  - **Reason**: Content ID not found.
  - **Content**: `{ "message": "Content not found" }`

- **Code**: `401 Unauthorized`
  - **Reason**: User tries to delete someone else's content.
  - **Content**: `{ "message": "User not authorized" }`
