# Vegadunk-01: project instructions

Your global rules in `~/.claude/CLAUDE.md` apply here in full. This file only adds
project context and resolves the few places where a personal learning project
differs from Healthee work. When the two disagree, this file wins for this repo.

## What this is
A small personal web app (phone + desktop browser) that hosts our training
material (recovery protocol, workout routine, food plan, currently in Excel) and
syncs health data (manual/CSV first, Apple Health next). Think "Bevel, but ours".
Two or three users. Not a product.

## Why this exists (read first)
The real goal is learning software architecture while building something useful.
Shipping fast matters less than understanding why the code is shaped the way it
is. Every change is a teaching moment.

## Learning loop (how the global workflow serves this goal)
The planner → executor → PR flow from the global rules stays as is. Two steps
carry the learning:
1. **Plan stage:** run `explain-change` in explain mode on the planner's output,
   exactly as the global workflow says. Make sure it covers: why this shape, at
   least one alternative and why it lost, what breaks at 10x or 100x users or
   data, and the names of the patterns used (so Luis can look them up).
2. **Retro stage:** after the PR, run `explain-change` in retro mode. Anything
   durable also goes into `docs/DECISIONS.md` as an ADR (date, context,
   decision, alternatives, consequences).
If `explain-change` is unavailable in a session, write the same content by hand
as an "Architecture note" (5 to 12 lines). Never skip it; for a trivial change,
one line saying why it is trivial is enough.

## Differences from Healthee work
- **No #rnd-review-farm announcement.** This is a personal repo; the PR itself is
  the finish line. CI must still be green before reporting done.
- **No AWS profile, no healthee-cli, no tracer-cli, no vault rules.** None apply.
- **No PR attribution footer**, same as the global rule.
- **GitHub links:** until the repo has a remote, reference files as plain
  absolute paths in inline code. Once `git remote get-url origin` resolves, switch
  to GitHub links as the global rule requires.
- Git permission rules are unchanged: ask before any state-changing git command
  in Luis's own checkout; worktree exceptions apply as globally defined.

## Stack (decided)
- Next.js (App Router, TypeScript), one repo for UI and API routes.
- Postgres via Prisma: routines, sessions and meals are naturally tabular, and
  schema design plus migrations are things worth learning.
- Auth.js (NextAuth) with email magic link; real accounts from day one.
- Tailwind; mobile first; installable as a PWA.
- Vercel for hosting plus a managed Postgres (Neon or Supabase, decide in the
  first ADR).
- Package manager: npm (matches Healthee repos, so habits transfer).
- Tests: Vitest for unit tests. Playwright only when an e2e test is actually
  needed, not before.
- Prettier plus ESLint, enforced with a Husky/lint-staged pre-commit hook.
- Validation of every external input (forms, uploads, ingest API) with zod.
- Secrets live in `.env.local` (git-ignored) and Vercel env vars; `.env.example`
  is committed. Nothing secret in client components.
- Error tracking and structured logging from the first milestone (Sentry free
  tier, pino), plus a `/api/health` endpoint. This mirrors Healthee's
  production-readiness checklist and is cheaper to add early than late.

## Domain model
Introduce a table only when a milestone needs it (Simplicity First). The
expected shape, for orientation, not as a todo list:
- `User`: account; everything below is per user.
- `Program` → `Phase`: a named plan with ordered, dated sections.
- `Exercise`: catalogue entry (name, muscle group, notes, knee-safe flag).
- `WorkoutTemplate` → `TemplateExercise`: what a session should be.
- `WorkoutSession` → `SetLog`: what actually happened.
- `Meal` / `FoodEntry`: food plan and logged intake.
- `HealthSample`: one normalised time-series table typed by a `kind` enum, not
  one table per metric.
- `Import`: a record of every file upload (who, when, source, row counts,
  errors). Re-uploading the same file must not duplicate rows (idempotent).

## Excel import
- Source sheets live in `data/source/` (git-ignored). After import the app is
  the source of truth; Excel is an input format, not a sync target.
- Parsers live in `src/lib/import/` and are pure functions (file bytes → typed
  rows). DB writes happen in a transaction in `src/server/`. Keep them separate
  so parsers are unit-testable without a database.

## Health data
- First: manual entry and CSV upload through the same `Import` pipeline.
- Then: Apple Health via an iOS Shortcut that POSTs JSON to
  `/api/health/ingest` with a per-user API token. HealthKit cannot be read from
  a browser; record that constraint in the ADR. Document the Shortcut in
  `docs/APPLE_HEALTH.md`.
- Anything beyond that is out of scope until asked for.

## Conventions
- Folder layout: `src/app` (routes), `src/components`, `src/lib` (domain logic,
  no React or Next imports), `src/server` (DB access, auth), `prisma/`, `docs/`,
  `tests/`.
- Routes are thin; domain logic never imports React or Next.
- Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`), one branch per
  change, PR descriptions in the two-part form from the global rules.
- Prefer boring, well-documented libraries over clever ones.
- No em dashes or en dashes anywhere, including code comments.

## Working with Luis
- Technical Support Engineer: comfortable with APIs, logs, debugging and
  tickets; newer to building and structuring apps. No need to define HTTP or
  JSON; do define things like "ORM", "migration", "server component".
- Concise and direct. Draft, let him review, then act on one-word approvals.
- Technical outputs in English. Structured output plus a short plain-language
  summary, per the global style rule.

## Roadmap
See `docs/PLAN.md`.
