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
