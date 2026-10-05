# Vegadunk

A small personal web app for our training routine, recovery protocol, food plan and health data. Roadmap in `docs/PLAN.md`, architecture decisions in `docs/DECISIONS.md`.

## Run locally

Requires Node 20.19+, 22.12+ or 24+, and Docker.

```bash
npm install
cp .env.example .env.local
npm run db:up
npm run db:check
npm run dev
```

Open http://localhost:3000. `npm run db:migrate` applies schema changes, `npm run db:studio` browses data, `npm run db:down` stops the database (data stays in a Docker volume; `docker compose down -v` wipes it). Other scripts: `npm run lint`, `npm run build`, `npm run format`, `npm run format:check`. A pre-commit hook (Husky plus lint-staged) lints and formats staged files.
