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
