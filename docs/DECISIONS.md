# Architecture decisions (ADRs)

One entry per durable decision. Newest at the bottom.

Format:
- Date
- Title
- Context: the problem and the forces at play
- Decision: what we chose
- Alternatives: what else was considered and why it lost
- Consequences: what gets easier, what gets harder, what breaks at scale

---

## 2026-10-05: Next.js + Prisma + Postgres on Neon

**Context.** Personal training app for 2 to 3 users, built primarily to learn
architecture. Data (programs, sessions, sets, meals, health samples) is
relational. Hosting must be free or near-free and need zero ops.

**Decision.** Next.js (App Router, TypeScript) as a single full-stack repo;
Prisma as ORM; Postgres hosted on Neon; Auth.js for login; Vercel for deploy.

**Alternatives.**
- React + separate Express API: clearer separation, but twice the deploy
  surface for a project this size. Revisit if the API ever needs non-browser
  clients beyond the Apple Health ingest.
- Supabase instead of Neon: bundles auth, storage and auto APIs. Rejected
  because those bundles would replace the parts we want to learn (auth, data
  access), and its free tier pauses after a week idle.
- SQLite (Turso/libSQL): simpler, but no branching and weaker fit for
  learning migrations and concurrent writes.

**Consequences.** Serverless Postgres scales to zero (cost ~0). Neon branching
gives a DB copy per PR, matching the branch-per-change workflow. Cold starts of
a few hundred ms are acceptable. At 100x users the single-region DB and the
lack of a cache layer would be the first things to change.

## 2026-10-05: The project pins its own npm registry

**Context.** npm reads its settings from the machine (`~/.npmrc`) unless the
project overrides them. Luis's machine points npm at a private work registry.
Scaffolding the app there failed on an expired token, and a successful install
would have written that private host into `package-lock.json`, which Vercel
and any other machine cannot reach.

**Decision.** A committed `.npmrc` at the repo root sets
`registry=https://registry.npmjs.org/`. The project, not the machine, decides
where packages come from. `package-lock.json` is committed so every install
gets the exact same versions.

**Alternatives.**
- Fix the machine's global config: works for one laptop, but leaves the build
  dependent on whoever runs it. The next machine or CI runner repeats the
  problem.
- Pass `--registry` on every command: easy to forget, and Vercel would not know
  about it.

**Consequences.** Installs behave the same on the laptop, Vercel and future CI.
Using a private package later would need a scoped registry line in this file.
Nothing here changes with more users; the benefit grows with the number of
machines and people that install the project.

## 2026-10-05: Prisma 7 with a local Postgres in Docker

**Context.** The app needs a database layer before Auth.js can store users.
Production will be Neon (see the first ADR). Development needs a Postgres that
matches production, works offline and can be thrown away. Prisma 7 changed its
defaults: the client is generated into the project as TypeScript, it talks to
Postgres through a driver adapter (`@prisma/adapter-pg`), and the CLI reads its
settings from `prisma.config.ts` and no longer loads `.env` files by itself.

**Decision.** Prisma 7.10.0 (CLI, client and pg adapter pinned exactly) with
Postgres 18 in Docker Compose for local work. One env file, `.env.local`:
Next.js reads it natively and `prisma.config.ts` loads it with `@next/env`, the
same loader Next uses. The generated client lives in `src/generated/prisma`
(git-ignored, rebuilt by `postinstall`). One shared client in
`src/server/db.ts`, cached on `globalThis` in development so hot reload does
not open a new connection pool on every save. No tables yet: the first model
and migration arrive with `User` in the Auth.js task.

**Alternatives.**
- Drizzle: lighter, no code generation, closer to SQL. Lost because the stack
  ADR already chose Prisma, and its schema file plus `migrate dev` is a gentler
  way to learn migrations.
- Postgres.app or Homebrew: no Docker, but the version belongs to the machine,
  not the project, and a reset is manual. Compose pins the version in the repo
  and `docker compose down -v` gives a clean slate.
- A Neon branch for development: same engine as production and nothing to run,
  but every query needs the internet, adds latency and uses free-tier quota.
- `prisma dev` (Prisma's built-in local Postgres, suggested by `prisma init`):
  no Docker, but ties local work to Prisma tooling instead of plain Postgres.
- `.env` for Prisma plus `.env.local` for Next: the default setup, but two files
  holding the same secret drift apart.

**Consequences.** Anyone with Docker gets the same database with
`npm run db:up`. The CLI and the app read the same file, so a wrong URL fails
the same way in both. `npm install` must run before lint or build because the
client is generated. Postgres listens only on 127.0.0.1 with a throwaway
password. npm's `latest` tag for `prisma` already points at an 8.0 release
candidate, so versions stay pinned and Prisma 8 gets its own ADR. The deploy
task should create the Neon project on Postgres 18 (or move the local image to
Neon's version). On Neon, migrations need the direct URL while the app uses the
pooled one; Prisma 7 dropped `directUrl`, so the deploy task points
`prisma.config.ts` at the unpooled URL. At 100x users the first pressure is
connections, not data: every serverless instance opens its own pool, which is
why production goes through Neon's pooler.
