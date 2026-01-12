# Frontend Implementation Plan

## 1. Project Overview
This document outlines the architecture and implementation details for the React frontend of the Smart Content Generator. The frontend will communicate with the existing Node.js backend via REST API and Socket.IO for real-time updates.

## 2. Tech Stack
- **Framework**: React (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + ShadcnUI (optional) or Vanilla CSS (as per prompt, we will stick to custom Tailwind/CSS for "rich aesthetics")
- **State Management**: Zustand (Global Auth/Socket State) + React Query (Server State)
- **Routing**: React Router DOM v6+
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client
- **Forms**: React Hook Form + Zod (Validation)

## 3. Folder Structure
```
src/
├── components/          # Reusable UI components
│   ├── auth/            # Login/Register forms
│   ├── layout/          # Navbar, Sidebar, ProtectedRoute
│   ├── ui/              # Buttons, Inputs, Cards, Loaders
│   └── content/         # ContentCard, Editor, GeneratorForm
├── pages/               # Main Page Views
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Dashboard.tsx    # Stats + Recent Activity
│   ├── Generator.tsx    # Smart Content Generator Page
│   └── Library.tsx      # Content Library (CRUD)
├── services/            # API & Socket services
│   ├── api.ts           # Axios instance & interceptors
│   ├── authService.ts
│   ├── contentService.ts
│   └── socketService.ts
├── store/               # State Management
│   ├── useAuthStore.ts  # Session state
│   └── useJobStore.ts   # Active Generation Jobs
└── utils/               # Helpers
    ├── format.ts
    └── validation.ts
```

## 4. API & Socket Integration

### Base URL
`http://localhost:5000`

### Authentication (`/auth`)
- **Login**: `POST /auth/login` -> Store JWT in localStorage/Cookies.
- **Register**: `POST /auth/register`
- **Session**: `GET /auth/me` (On app load)

### Content Library (`/content`)
- **Fetch**: `GET /content`
- **Update**: `PUT /content/:id`
- **Delete**: `DELETE /content/:id`

### Smart Generator (`/generate-content`)
- **Queue Job**: `POST /generate-content` (Prompt, Type)
- **Get Job Status**: `GET /generate-content/:jobId`
- **Save Result**: `POST /generate-content/:jobId/save`
- **List Jobs**: `GET /generate-content`

### Real-time Updates (Socket.IO)
- Connect using JWT token in `auth.token`.
- Listen for `job_completed` event.
- Update `useJobStore` and trigger notification/toast.

## 5. Key Features & Implementation Details

### A. Authentication
- **ProtectedRoute Component**: Checks for token. If missing, redirect to `/login`.
- **Axios Interceptor**: Automatically attaches `Authorization: Bearer <token>` to requests. Handle 401 response by logging out.

### B. Smart Content Generator
1. **Input Form**: User enters Topic/Prompt and selects Type (Blog, Caption, etc.).
2. **Submission**: Calls `POST /generate-content`. Backend returns `jobId` and `delaySeconds` (or default 60s).
3. **Optimistic UI**: Add job to `useJobStore` with status `pending`. Start a 60s countdown timer implementation on UI for UX.
4. **Polling/Socket**:
   - **Preferred**: Socket.IO listens for `job_completed`.
   - **Fallback**: Poll `GET /generate-content/:jobId` every 5 seconds if Socket fails.
5. **Completion**: When job is done, display Markdown content using `react-markdown`.
6. **Save**: "Save to Library" button calls `POST /generate-content/:jobId/save`.

### C. Content Library
- Grid layout of saved content cards.
- **Edit Mode**: Clicking edit turns the card text into a textarea or opens a modal.
- **Delete**: Confirmation dialog before API call.

### D. UI/UX Design System
- **Theme**: Dark/Light mode capable.
- **Components**:
  - `GradientButton`: For primary actions.
  - `GlassCard`: For content items using backdrop-filter.
  - `AnimatedLoader`: For generation state (pulsing or spinning).
- **Feedback**: usage of `react-hot-toast` or similar for success/error messages.

## 6. Implementation Steps
1. **Initialize Project**: `npm create vite@latest`
2. **Setup Tailwind**: Configure `tailwind.config.js`.
3. **Setup Services**: Create `api.ts` with Axios + Interceptors.
4. **Auth Flow**: Build Login/Register pages + Context/Store.
5. **Generator Core**: Build Form + Socket connection.
6. **Library**: Fetch and display content.
7. **Refine UI**: Add animations and styling.
