# Code Challenge

My solutions to the backend code challenge. Each problem lives in its own folder with the original brief (`question.md`) and the solution.

| Problem | Folder                     | Summary                                                                 |
| ------- | -------------------------- | ----------------------------------------------------------------------- |
| 4       | [`problem4/`](./problem4)  | Three implementations of `sum_to_n` with complexity analysis            |
| 5       | [`Problem5/`](./Problem5)  | CRUD backend server with ExpressJS, TypeScript and SQLite               |
| 6       | [`Problem6/`](./Problem6)  | Specification for a live scoreboard module (API, security, diagrams)    |

## Problem 4 — Three ways to sum to n

[`problem4/solution.js`](./problem4/solution.js) contains three implementations:

| Function     | Approach                | Time     | Space    |
| ------------ | ----------------------- | -------- | -------- |
| `sum_to_n_a` | Closed-form (Gauss)     | O(1)     | O(1)     |
| `sum_to_n_b` | Iterative loop          | O(\|n\|) | O(1)     |
| `sum_to_n_c` | Recursion               | O(\|n\|) | O(\|n\|) |

Negative `n` returns the signed sum (for example `sum_to_n(-5) === -15`), and `0` returns `0`.

```bash
node problem4/solution.js 5
```

## Problem 5 — CRUD server

An ExpressJS + TypeScript API for creating, listing (with filters), reading, updating and deleting a `resource`, persisted in SQLite and covered by integration tests.

```bash
cd Problem5
npm install
npm run dev   # http://localhost:3000
npm test
```

Configuration, API reference and examples: [`Problem5/README.md`](./Problem5/README.md).

## Problem 6 — Live scoreboard specification

A design document for a backend module that keeps a live top-10 scoreboard and only accepts authorised score updates. It covers the API contract, data model, Server-Sent Events live updates, security measures, and suggested improvements, with Mermaid diagrams of the execution flow.

Read it here: [`Problem6/README.md`](./Problem6/README.md).

## Requirements

- Node.js 20+
- npm
