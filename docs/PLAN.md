# Vegadunk-01: plan

Milestones are small on purpose. Each one ends with a working app and at least
one ADR in `DECISIONS.md`. Build only what the current milestone needs.

## M0: Skeleton (learn: project layout, tooling, deploy pipeline)
- [x] `npx create-next-app` (TypeScript, App Router, Tailwind, ESLint)
- [x] Prettier plus Husky/lint-staged pre-commit hook
- [x] Prisma plus Postgres (local via Docker; managed DB for prod)
- [ ] Auth.js email magic link; `User` model
- [ ] `/api/health`, pino logging, Sentry; `.env.example`
- [ ] Deploy to Vercel with a Neon database (ADR already written)
- [ ] PWA manifest and icon so it installs on the phone

## M1: Routine viewer (learn: schema design, server components, data fetching)
- [ ] Models: Program, Phase, Exercise, WorkoutTemplate, TemplateExercise
- [ ] Excel parser for the routine sheet (pure function plus unit tests)
- [ ] Upload page → `Import` record → transactional insert, idempotent
- [ ] "Today" screen: the session for today, mobile first

## M2: Logging (learn: mutations, forms, optimistic UI, validation)
- [ ] WorkoutSession plus SetLog; log sets from the phone during training
- [ ] Recovery protocol as a checklist with history
- [ ] Food plan sheet import plus daily meal view and log

## M3: Health data (learn: ingestion APIs, auth tokens, time-series modelling)
- [ ] `HealthSample` model plus CSV import
- [ ] `/api/health/ingest` with per-user token; iOS Shortcut documented
- [ ] Basic charts: sleep, HRV, weight against training load

## M4: Review (learn: what we would do differently)
- [ ] Revisit every ADR: what would we change now, and why
- [ ] "How to debug this app" doc
- [ ] Decide whether anything else (summaries, notifications, other wearables)
      is actually wanted before building it

## Decided
- Neon for Postgres (ADR 2026-10-05 in `DECISIONS.md`).
- Excel structure analysed in `EXCEL_STRUCTURE.md`; source file in `data/source/`.
- Each user has their own Program. Only the Exercise catalogue is shared.
