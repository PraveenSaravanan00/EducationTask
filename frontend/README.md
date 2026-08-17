# QA Editor — Frontend

React 19 + TypeScript + Vite editor application for authoring assessment documents with real-time validation and live preview.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | React 19 |
| Language | TypeScript |
| Build Tool | Vite |
| Routing | React Router DOM v7 |
| HTTP Client | Axios |
| Icons | React Icons (Remix Icon set) |

---

## Project Structure

```
frontend/src/
├── types/
│   └── index.ts                    # Shared TypeScript interfaces (User, Document, Question)
├── services/
│   └── api.ts                      # Axios instance + auto-refresh interceptor
├── context/
│   └── AuthContext.tsx             # JWT state — login, register, logout, session restore
├── pages/
│   ├── LoginPage.tsx               # Login form with error handling
│   ├── RegisterPage.tsx            # Register form with error handling
│   └── EditorPage.tsx              # Main two-panel workspace
├── components/
│   ├── editor/
│   │   ├── QuestionBlock.tsx       # Single question editor with real-time validation
│   │   └── QuestionList.tsx        # Manages all question blocks + add buttons
│   ├── preview/
│   │   └── PreviewPane.tsx         # Live preview with global + per-question answer toggle
│   └── ui/
│       └── ConfirmModal.tsx        # Custom React modal (replaces browser confirm())
├── App.tsx                         # React Router setup + protected/public route guards
├── main.tsx                        # App entry point
└── index.css                       # Full design system (dark mode, tokens, components)
```

---

## Setup

### 1. Prerequisites

- **Node.js** 18 or above
- Backend server running at `http://localhost:4000`

### 2. Install dependencies

```bash
cd frontend
npm install
```

### 3. Configure environment

The `.env` file should contain:

```env
VITE_API_URL=http://localhost:4000
```

### 4. Start the dev server

```bash
npm run dev
```

App runs at → `http://localhost:5173`

---

## Pages & Routing

| Route | Component | Access |
|-------|-----------|--------|
| `/` | Redirects to `/editor` | — |
| `/login` | `LoginPage` | Public only (redirects if logged in) |
| `/register` | `RegisterPage` | Public only (redirects if logged in) |
| `/editor` | `EditorPage` | Protected (redirects to `/login` if not logged in) |
| `*` | Redirects to `/` | — |

---

## Key Features

### Editor Workspace
- **Sidebar** — Create, list, and delete documents. Collapsible with icon-only mode.
- **Two-panel layout** — Editor on the left, live preview on the right.
- **Document title** — Editable inline at the top of the editor panel.
- **Save** — Persists title + all questions to the backend with a single PUT request.

### Question Types
| Type | How it works |
|------|-------------|
| Multiple Choice | 2–6 options; radio button selects the correct answer |
| True / False | Two toggle buttons (True / False) |
| Short Answer | Free-text field for the expected correct answer |

### Real-Time Validation
Each `QuestionBlock` validates itself on every change after the first interaction (`touched` state). Errors appear inline below the relevant field. Validation rules:

- **All types** — Question text cannot be empty
- **Multiple Choice** — At least 2 non-empty options; correct answer must be selected
- **True / False** — Correct answer (True or False) must be selected
- **Short Answer** — Expected answer field cannot be empty

A green **✓ Valid** badge appears once all fields pass.

### Preview Pane
- **Global toggle** — Show/hide answers for all questions at once
- **Per-question toggle** — Override visibility for individual questions
- Toggling global resets all per-question overrides
- No full document re-render — only visibility state changes

### Custom Confirm Modal
Deleting a document triggers a custom `ConfirmModal` (not `window.confirm()`). Features:
- Click the overlay to cancel
- Press `Escape` to cancel
- Smooth scale-in animation

### JWT Token Management
- Access token stored in `localStorage`, attached to every request via Axios interceptor
- On `401 TOKEN_EXPIRED` response, the interceptor **silently** calls `/auth/refresh`, updates tokens, and retries the original request
- On refresh failure, user is redirected to `/login`

---

## npm Packages

### Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^19 | UI framework |
| `react-dom` | ^19 | DOM rendering |
| `react-router-dom` | ^7 | Client-side routing |
| `axios` | latest | HTTP client with request/response interceptors |
| `react-icons` | latest | Icon library (Remix Icon `ri` set used throughout) |

### Dev Dependencies
| Package | Purpose |
|---------|---------|
| `typescript` | TypeScript compiler |
| `vite` | Dev server + build tool |
| `@vitejs/plugin-react` | Vite React plugin |
| `@types/react` | React type definitions |
| `@types/react-dom` | ReactDOM type definitions |
| `eslint` | Linting |

---

## Architecture Decisions

### AuthContext + localStorage
JWT tokens are stored in `localStorage` and restored on page load via `useEffect` in `AuthContext`. This keeps the user logged in across browser refreshes without hitting the server on every mount.

### Axios Interceptors
Two interceptors are registered on the shared Axios instance (`services/api.ts`):
1. **Request** — Attaches `Authorization: Bearer <token>` to every outgoing request
2. **Response** — On `401 TOKEN_EXPIRED`, calls `/auth/refresh`, updates `localStorage` with the new token pair, then retries the failed request transparently

### Isolated Question Validation
Each `QuestionBlock` owns its own `errors` and `touched` state. Validation only activates after the user has interacted with the block (`touched = true`), preventing red errors from flashing on freshly added empty questions.

### Preview State Without Re-render
`PreviewPane` uses two pieces of state:
- `showAnswers` — global boolean
- `perQuestion` — a `Record<number, boolean>` for per-question overrides

Toggling visibility updates only these flags. React's reconciler only re-renders the affected parts of the preview, not the full question list.
