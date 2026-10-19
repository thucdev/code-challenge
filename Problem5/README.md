# Problem 5 — CRUD Server (ExpressJS + TypeScript)

A small backend service exposing a CRUD API for a generic `resource` entity, persisted in SQLite.

## Tech stack

- **ExpressJS 5** (HTTP server and routing)
- **TypeScript** (type-safe source code)
- **SQLite** via [`better-sqlite3`](https://github.com/WiseLibs/better-sqlite3) (file-based database, no separate server needed)
- **Zod** (validates request bodies, query strings and path params)
- **Vitest + Supertest** (integration tests)

## Requirements

- Node.js **20+** (developed on Node 24)
- npm

## Configuration

Set these as environment variables. Every one has a default, so you don't need to set any of them.

| Variable  | Default         | Description                       |
| --------- | --------------- | --------------------------------- |
| `PORT`    | `3000`          | Port the HTTP server listens on   |
| `DB_PATH` | `./data/app.db` | Path to the SQLite database file  |

On startup the server creates the database file and its directory if they're missing, and runs the schema migration automatically.

## Running the application

```bash
cd Problem5
npm install

# Development (auto-reload)
npm run dev

# Production
npm run build
npm start

# Tests
npm test
```

To use a different port or database file:

```bash
# bash
PORT=4000 DB_PATH=./data/dev.db npm run dev
```

```powershell
# PowerShell
$env:PORT=4000; $env:DB_PATH="./data/dev.db"; npm run dev
```

## Data model

```ts
interface Resource {
  id: number;
  name: string;          // required, 1–200 chars
  description: string;   // optional, up to 2000 chars, defaults to ""
  category: string;      // required, 1–100 chars
  status: "active" | "inactive" | "archived"; // defaults to "active"
  createdAt: string;     // ISO 8601
  updatedAt: string;     // ISO 8601
}
```

## API

Base URL: `http://localhost:3000`

| Method   | Path             | Description                       | Success |
| -------- | ---------------- | --------------------------------- | ------- |
| `GET`    | `/health`        | Health check                      | 200     |
| `POST`   | `/resources`     | Create a resource                 | 201     |
| `GET`    | `/resources`     | List resources with filters       | 200     |
| `GET`    | `/resources/:id` | Get details of a resource         | 200     |
| `PATCH`  | `/resources/:id` | Update some fields of a resource  | 200     |
| `DELETE` | `/resources/:id` | Delete a resource                 | 204     |

### List filters (`GET /resources`)

| Query param | Description                                         | Default     |
| ----------- | --------------------------------------------------- | ----------- |
| `name`      | Case-insensitive partial match on name              | —           |
| `category`  | Exact match on category                             | —           |
| `status`    | `active`, `inactive` or `archived`                  | —           |
| `sortBy`    | `name`, `createdAt` or `updatedAt`                  | `createdAt` |
| `order`     | `asc` or `desc`                                     | `desc`      |
| `limit`     | Page size (1–100)                                   | `20`        |
| `offset`    | Number of records to skip                           | `0`         |

Response shape:

```json
{
  "data": [ { "id": 1, "name": "Laptop", "...": "..." } ],
  "meta": { "total": 1, "limit": 20, "offset": 0 }
}
```

### Errors

Every error uses the same response shape:

```json
{
  "error": {
    "message": "Validation failed",
    "details": [{ "path": "name", "message": "Too small: expected string to have >=1 characters" }]
  }
}
```

- `400` for invalid body, query or id, malformed JSON, unknown fields, or an empty update
- `404` when the resource or route doesn't exist
- `500` for unexpected errors

### Example requests

```bash
# Create
curl -X POST http://localhost:3000/resources \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop","category":"electronics","description":"16GB RAM"}'

# List with filters
curl "http://localhost:3000/resources?category=electronics&status=active&name=lap&sortBy=name&order=asc&limit=10"

# Get one
curl http://localhost:3000/resources/1

# Update
curl -X PATCH http://localhost:3000/resources/1 \
  -H "Content-Type: application/json" \
  -d '{"status":"archived"}'

# Delete
curl -X DELETE http://localhost:3000/resources/1
```

## Project structure

```
Problem5/
├── src/
│   ├── app.ts                      # Express app factory (middleware + routes)
│   ├── server.ts                   # Entry point: opens the DB and starts listening
│   ├── config.ts                   # Environment configuration
│   ├── db.ts                       # SQLite connection + schema migration
│   ├── errors.ts                   # HttpError, 404 and error-handling middleware
│   └── resources/
│       ├── resource.schema.ts      # Zod schemas and types
│       ├── resource.repository.ts  # Data access (SQL)
│       └── resource.router.ts      # HTTP handlers
└── tests/
    └── resources.test.ts           # Integration tests (in-memory SQLite)
```
