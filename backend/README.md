# QA Editor — Backend

Node.js + Express 5 + MongoDB REST API with JWT authentication (access + refresh token rotation).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18+ |
| Framework | Express 5 |
| Database | MongoDB via Mongoose |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Language | TypeScript (ts-node, ESM) |
| Dev Server | Nodemon |

---

## Project Structure

```
backend/
├── src/
│   ├── app.ts                      # Express app — CORS, middleware, route mounting
│   ├── server.ts                   # Entry point — starts HTTP server
│   ├── config/
│   │   └── db.ts                   # MongoDB connection
│   ├── models/
│   │   ├── User.ts                 # User schema (name, email, password, refreshToken)
│   │   └── Document.ts             # Document schema with embedded Question sub-docs
│   ├── utils/
│   │   └── token.ts                # generateAccessToken, generateRefreshToken, verify
│   ├── middleware/
│   │   └── authMiddleware.ts       # Bearer JWT verification → attaches req.user
│   ├── controllers/
│   │   ├── authController.ts       # register, login, refresh, logout, getMe
│   │   └── documentController.ts  # Document CRUD + per-question operations
│   └── routers/
│       ├── authRouter.ts           # /auth/* routes
│       └── documentRouter.ts      # /documents/* routes (all protected)
├── .env
├── package.json
└── tsconfig.json
```

---

## Setup

### 1. Prerequisites

- **Node.js** 18 or above
- **MongoDB** running locally on default port, or a MongoDB Atlas connection string

### 2. Install dependencies

```bash
cd backend
npm install
```

### 3. Configure environment

The `.env` file is already present. Verify or update it:

```env
PORT=4000
MONGODBURL=mongodb://localhost:27017/BlendedEducation
JWT_ACCESS_SECRET=blended_access_super_secret_2024
JWT_REFRESH_SECRET=blended_refresh_super_secret_2024
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```


### 4. Start the dev server

```bash
npm run server
```

Server runs at → `http://localhost:4000`

---

## API Reference

### Base URL
```
http://localhost:4000
```

### Health Check
```
GET /health
```
Response: `{ "status": 200, "message": "Server is healthy ✅" }`

---

### Auth Endpoints

#### Register
```
POST /auth/register
```
Body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```
Response: `201` — Returns `accessToken`, `refreshToken`, and `user` object.

---

#### Login
```
POST /auth/login
```
Body:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
Response: `200` — Returns `accessToken`, `refreshToken`, and `user` object.

---

#### Refresh Tokens
```
POST /auth/refresh
```
Body:
```json
{
  "refreshToken": "<your-refresh-token>"
}
```
Response: `200` — Returns a **new** `accessToken` and `refreshToken` pair.  
The old refresh token is immediately invalidated (rotation). If the old token is reused, both tokens are invalidated and the user must log in again.

---

#### Logout
```
POST /auth/logout
```
Body:
```json
{
  "refreshToken": "<your-refresh-token>"
}
```
Response: `200` — Clears the stored refresh token in the database.

---

#### Get Current User (Protected)
```
GET /auth/me
Authorization: Bearer <accessToken>
```
Response: `200` — Returns the authenticated user's profile.

---

### Document Endpoints (All Protected)

All document routes require:
```
Authorization: Bearer <accessToken>
```

#### List Documents
```
GET /documents
```
Returns all documents belonging to the authenticated user, sorted by last updated.

#### Create Document
```
POST /documents
```
Body:
```json
{
  "title": "JavaScript Fundamentals"
}
```

#### Get Single Document
```
GET /documents/:id
```

#### Update Document
```
PUT /documents/:id
```
Body:
```json
{
  "title": "Updated Title",
  "questions": [...]
}
```

#### Delete Document
```
DELETE /documents/:id
```

---

### Question Endpoints (Nested under Documents)

#### Add Question
```
POST /documents/:id/questions
```
Body (Multiple Choice example):
```json
{
  "type": "multiple-choice",
  "questionText": "What is the output of typeof null?",
  "options": ["null", "object", "undefined", "string"],
  "correctAnswer": "object",
  "order": 0
}
```

Supported `type` values:
- `"multiple-choice"` — requires `options` array and `correctAnswer`
- `"true-false"` — `options` should be `["True", "False"]`, `correctAnswer` is `"True"` or `"False"`
- `"short-answer"` — `options` is `[]`, `correctAnswer` is a string

#### Update Question
```
PUT /documents/:id/questions/:qid
```

#### Delete Question
```
DELETE /documents/:id/questions/:qid
```

---

## npm Packages

### Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| `express` | ^5 | Web framework |
| `mongoose` | ^9 | MongoDB ODM |
| `jsonwebtoken` | latest | JWT sign + verify |
| `bcryptjs` | latest | Password hashing (salt rounds: 12) |
| `cors` | latest | Cross-origin resource sharing |
| `dotenv` | latest | Load `.env` variables |
| `nodemon` | latest | Auto-restart on file change |

### Dev Dependencies
| Package | Purpose |
|---------|---------|
| `typescript` | TypeScript compiler |
| `ts-node` | Run TypeScript directly with Node.js |
| `@types/express` | Express type definitions |
| `@types/jsonwebtoken` | JWT type definitions |
| `@types/bcryptjs` | bcrypt type definitions |
| `@types/cors` | CORS type definitions |
| `@types/node` | Node.js type definitions |

---

## Architecture Decisions

### JWT Refresh Token Rotation
Access tokens have a **15-minute** lifetime to limit exposure. Refresh tokens last **7 days** and are stored in the database. On every token refresh:
1. The incoming refresh token is verified against the stored value
2. A **new pair** is issued and the old refresh token is overwritten
3. If the same refresh token is used twice (replay attack), both tokens are cleared — forcing re-login

### Embedded Questions
Questions live as sub-documents inside the `Document` collection rather than a separate `Question` collection. This means a document and all its questions are fetched/saved in a **single MongoDB operation**, which keeps things simple and atomic for this use case.
