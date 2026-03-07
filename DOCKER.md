# Docker Setup

This project supports two Docker environments:

- **Development** — Uses [Neon Local](https://neon.com/docs/local/neon-local) to create ephemeral database branches from your Neon Cloud project.
- **Production** — Connects directly to your Neon Cloud database.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose v2+
- A [Neon](https://neon.tech) account with an existing project
- A [Neon API key](https://neon.tech/docs/manage/api-keys) (for dev / Neon Local)

## Development

### 1. Configure environment

Copy and fill in `.env.development`:

```sh
# Get these from your Neon dashboard
NEON_API_KEY=neon_api_key_xxxxx
NEON_PROJECT_ID=your-project-id
PARENT_BRANCH_ID=br-xxxxx          # branch to fork ephemeral branches from (usually main)

PORT=3000
NODE_ENV=development
LOG_LEVEL=debug
JWT_SECRET=dev-secret-change-me
```

> `DATABASE_URL` is **not** needed in `.env.development` — it is automatically set to `postgres://neon:npg@neon-local:5432/neondb` inside the compose network.

### 2. Start the stack

```sh
docker compose -f docker-compose.dev.yml up --build
```

This starts two services:

| Service      | Description                                                                 |
| ------------ | --------------------------------------------------------------------------- |
| `neon-local` | Neon Local proxy — creates an ephemeral branch on startup, deletes on stop. |
| `app`        | The Node.js application with hot-reload via `node --watch`.                 |

Source files (`src/`, `drizzle/`, `drizzle.config.js`) are bind-mounted, so changes are reflected immediately.

### 3. Run database migrations (inside the container)

```sh
docker compose -f docker-compose.dev.yml exec app npm run db:migrate
```

### 4. Stop and clean up

```sh
docker compose -f docker-compose.dev.yml down
```

Stopping the stack automatically deletes the ephemeral branch.

---

## Production

### 1. Configure environment

Fill in `.env.production` with your Neon Cloud connection string and secrets:

```sh
DATABASE_URL=postgresql://user:password@ep-xxxxx.us-east-1.aws.neon.tech/neondb?sslmode=require
PORT=3000
NODE_ENV=production
LOG_LEVEL=warn
JWT_SECRET=your-strong-production-secret
```

### 2. Build and start

```sh
docker compose -f docker-compose.prod.yml up --build -d
```

### 3. Run database migrations

```sh
docker compose -f docker-compose.prod.yml exec app npm run db:migrate
```

### 4. View logs

```sh
docker compose -f docker-compose.prod.yml logs -f app
```

---

## How `DATABASE_URL` switches between environments

| Environment | `DATABASE_URL` source                               | Neon Local? |
| ----------- | --------------------------------------------------- | ----------- |
| Development | Set in `docker-compose.dev.yml` → `neon-local:5432` | Yes         |
| Production  | Set in `.env.production` → Neon Cloud URL           | No          |

In development, the app detects `NEON_LOCAL=true` and configures the `@neondatabase/serverless` driver to route HTTP queries through the Neon Local proxy instead of the cloud endpoint. In production, the driver connects directly to Neon Cloud as usual.

---

## Useful commands

```sh
# Rebuild without cache
docker compose -f docker-compose.dev.yml build --no-cache

# Shell into the running app container
docker compose -f docker-compose.dev.yml exec app sh

# Open Drizzle Studio (dev only)
docker compose -f docker-compose.dev.yml exec app npm run db:studio
```
