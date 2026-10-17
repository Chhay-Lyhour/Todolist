# Daylist Todo App

React frontend and NestJS API backed by PostgreSQL.

## Requirements

- Node.js 20 or newer
- Docker Desktop with Docker Compose

## Run locally

From the project root:

```bash
npm install
npm run dev
```

`npm run dev` starts PostgreSQL in Docker, waits for it to become healthy, then starts the API and frontend. Open the Vite URL shown in the terminal (usually `http://localhost:5173`). The API is at `http://localhost:3000/api`. The first API startup runs the database migration, creating the `todos` and `profiles` tables and the starter profile.

To stop the app, press Ctrl+C. PostgreSQL stays running so its data remains available between runs. Stop PostgreSQL with `docker compose down`; its data remains in a Docker volume. To delete the database and all its data, run `docker compose down -v`.

## Build

```bash
npm run build
```

This builds both the React frontend and NestJS API. Building does not start PostgreSQL or the app; use the local run instructions above to run them.

## TablePlus

TablePlus is optional. Create a PostgreSQL connection using:

| Setting | Value |
| --- | --- |
| Host | `localhost` |
| Port | `5432` |
| User | `postgres` |
| Password | `postgres` |
| Database | `todo` |

These are local development defaults only. Set the `DB_*` environment variables for a different local database. Do not use the sample password for a public or production database.
# Todolist
