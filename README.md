# Vegadunk

A small personal web app for our training routine, recovery protocol, food plan and health data. Roadmap in `docs/PLAN.md`, architecture decisions in `docs/DECISIONS.md`.

## Run locally

Requires Node 20.9 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000. Other scripts: `npm run lint`, `npm run build`, `npm run format`, `npm run format:check`. A pre-commit hook (Husky plus lint-staged) lints and formats staged files.
