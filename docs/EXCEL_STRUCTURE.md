# RUTINA_DEF.xlsx: structure and what it means for the import

Source file: `data/source/RUTINA_DEF.xlsx` (git-ignored). Nine sheets, all
free-form layouts built for reading, not for machines: merged cells (20 to 87
per sheet), section banners, multiple tables per sheet, mixed-content cells
("45 x 8", "27 x 10 / 25 x 10", "25 x 10 IZQ / 10 DER").

## Sheets

| Sheet | Kind | Content |
|---|---|---|
| RESUMEN | Dashboard | Current phase and block, medical notes, next milestone, weekly calendar (day → session → focus → isometrics) |
| PLAN 12 SEM | Program | Three blocks with objective and exit criteria; progression ladders per movement pattern (today / B1 / B2 / B3); gates; adjustment rules; constants |
| MAR - INFERIOR A | Session template | Session order (steps with duration), pre-session warm-up table, main block (exercise → sets → rep/cue → S1..S4 logged "weight x reps"), exit criteria, weekly load targets |
| MIERJUE - SUPERIOR A | Session template | Same shape as above |
| VIE - INFERIOR B | Session template | Same shape |
| SAB - SUPERIOR B | Session template | Same shape |
| DOM - FUNCIONAL | Session template | Same shape |
| MOVILIDAD | Reference | Daily short routine, weekly long session, avoid/substitute table, hip block with baseline test |
| DIA A DIA REHAB | Daily log | One row per day since PRP: date, phase, isometrics, walking, bike, swimming, gym allowed, heat/ice, free-text notes |

## Observations that shape the data model

1. **Template and log are mixed in one table.** The main block of each session
   sheet has the prescription (sets, rep range, cues) and the actual results
   (S1..S4 columns, "weight x reps") side by side. In the app these split into
   `WorkoutTemplate` / `TemplateExercise` (prescription) and `WorkoutSession` /
   `SetLog` (results). This is the single most important modelling lesson in the
   file.
2. **Weight and reps live in one string.** "45 x 8", "27 x 10 / 25 x 10"
   (left / right), "10" (reps only, weight implied from set 1). The parser must
   normalise these into numeric `weightKg`, `reps`, `side` (L / R / both). Rows
   it cannot parse go into `Import.errors`, never silently dropped.
3. **Program > Block > Week > Session.** "PLAN 12 SEM" defines three blocks of
   about four weeks; session sheets have S1..S4 columns (S4 = deload). That maps
   to `Program` → `Phase` (block) → weekly `WorkoutSession`s.
4. **Progression ladders and gates are rules, not rows.** The ladders (pattern →
   target per block) and gates (what must be true before the next block) are
   part of the program design. First version: store them as structured text on
   `Phase`. Modelling them as data is a later decision, only if something needs
   to compute with them.
5. **The daily rehab log is already tabular.** "DIA A DIA REHAB" is the easiest
   import: one row per day, fixed columns. Maps to a daily `RehabEntry` (or a
   generic `DailyCheckin`) with phase, prescribed isometrics, activity limits,
   heat/ice, notes. Some rows span two lines (phase label split), so the parser
   must merge them.
6. **Mobility and warm-ups are reference content**, not logged. Store as
   `Exercise` catalogue entries plus a `Routine` grouping with dose and sets.
   Low priority.
7. **Spanish throughout, Rioplatense.** Keep the original names as the display
   name; add an optional English alias only if ever needed.

## Import strategy (M1)

- Do not try to parse the layout generically. Write one small parser per sheet
  kind (session sheet, daily log, program plan), each a pure function with a
  fixture-based unit test.
- Start with the five session sheets (same shape, highest value), then the
  daily log, then the plan. RESUMEN and MOVILIDAD are not imported in M1.
- Idempotency key: file hash plus sheet name plus row index.

## Confirmed decision

Each user has their own `Program`. Nothing is shared between users except the
`Exercise` catalogue, which is global but extendable per user.
