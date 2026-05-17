# Arch Constructor

A web app that **designs web app architectures**. Fill in project requirements (RPS, data shape, team size, compliance...) and get back a backend architecture: components, ADRs, and a Mermaid diagram.

The core is a pure rule engine (`Input → Architecture`) — each rule encodes an architectural decision with its rationale. Adding a new rule is the unit of progress.

## Live demo

- **Web:** <https://arch-constructor-web.vercel.app>
- **API:** <https://arch-api-rbp0.onrender.com/api/health>

## Stack

| Layer | Tech |
|---|---|
| Rule engine | TypeScript, zod (shared input schema) |
| API | NestJS, Prisma, PostgreSQL |
| Web | Next.js 15 (App Router), React 19, Tailwind, mermaid |
| Tooling | pnpm workspaces, Vitest, Docker |

## Architecture

```
arch-constructor/
├── packages/
│   └── core/                ← @arch/core: rule engine + renderers (zod schemas, Architecture types)
├── apps/
│   ├── api/                 ← Nest: REST API, Prisma, persists Designs
│   └── web/                 ← Next.js: form (RHF + zod) + result page (Mermaid)
└── docker-compose.yml       ← local Postgres
```

Key invariants:

- **Single source of truth for input.** `InputSchema` lives in `@arch/core` and validates both client-side (RHF resolver) and server-side (Nest pipe). No DTO duplication.
- **Architecture is persisted, not recomputed.** When you save a Design, its `architecture` and `engineVersion` are stored. Changing rules later doesn't silently mutate old designs.
- **Engine is pure.** `build(input): Architecture` has no I/O. All persistence happens at the API layer.

## Quick start

Prereqs: Node 20+, pnpm, Docker.

```bash
pnpm install
docker compose up -d                       # Postgres on :5433
pnpm --filter @arch/api prisma migrate dev # initial schema
pnpm --filter @arch/api dev                # API on :3001
pnpm --filter @arch/web  dev               # Web on :3002
```

Open <http://localhost:3002/new>, fill in the form, get an architecture.

## Testing

```bash
pnpm test         # unit tests (core engine + api service)  — 39 tests
pnpm test:e2e     # api e2e via supertest against real Postgres — 13 tests
pnpm test:all     # both
pnpm typecheck    # tsc --noEmit across the workspace
```

E2E uses a separate Postgres schema (`?schema=test`) in the same container so dev data is untouched.

## API contract

| Method | Path | Notes |
|---|---|---|
| `POST` | `/api/designs` | Body `{ name?, input }`, returns full `Design` with computed architecture |
| `GET` | `/api/designs/:id` | Returns saved Design (404 if missing) |
| `PATCH` | `/api/designs/:id` | Rebuilds architecture only if `input` changed |
| `DELETE` | `/api/designs/:id` | 204; forks survive (`onDelete: SetNull`) |
| `POST` | `/api/designs/:id/fork` | Clones with `parentId` for what-if scenarios |
| `GET` | `/api/designs/:id/render?format=mermaid\|markdown` | Plain-text export |

Errors: `422` for schema violations, `404` for missing, `400` for syntactic issues.

## Adding a rule

1. Append a `Rule` to `packages/core/src/rules.ts` with `id`, `when`, `apply`.
2. Add a scenario test in `packages/core/tests/engine.test.ts`.
3. Bump `ENGINE_VERSION` in `packages/core/src/version.ts`.

The build loop is multi-pass to a fixpoint — rules can react to other rules' output. `addDecision` is idempotent, so it's safe.

## Deployment

- **API + DB**: Render or Railway. Build from `apps/api/Dockerfile`. Set `DATABASE_URL` to managed Postgres. Start command runs `prisma migrate deploy` before the server.
- **Web**: Vercel. Set Root Directory to `apps/web`, framework Next.js. Env: `NEXT_PUBLIC_API_URL=https://your-api-host/api`. Vercel handles pnpm workspaces automatically.

## License

MIT
