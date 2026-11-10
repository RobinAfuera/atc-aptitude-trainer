# ATC Aptitude Trainer

Timed cognitive drills for people preparing for air traffic controller
selection. It runs in the browser, scores each session on accuracy and speed,
and keeps your results on your own device so you can see whether practice is
moving them.

I am building it for my own preparation for ATC selection tests. It is at an
early stage: version 0.1 has the session engine and two drills, and the
[roadmap](ROADMAP.md) lists what comes next.

## Who it is for

Candidates for air traffic controller training who want to practise the
underlying abilities selection tests look at: working with numbers under time
pressure, spatial orientation, attention, memory and multitasking.

It trains abilities. It does not imitate any particular test, and it contains
no material from one (see [Independence](#independence)).

## Drills

| Drill | Ability | What you do | Levels |
| --- | --- | --- | --- |
| Mental arithmetic | Numerical | Work out a calculation in your head and type the result before the time bar runs out. | 1: add and subtract two-digit numbers. 2: multiply, divide, three-digit sums. 3: two-step calculations and speed, time and distance. |
| Heading turns | Spatial | Given a current heading and a new one, pick the shortest turn (direction and size) from four options. | 1: steps of 30°, compass marks both headings. 2: steps of 10°, compass marks the current heading only. 3: steps of 5°, no compass. |

Planned drills (radar conflicts, vigilance clock, digit span, dual task, cube
nets and more) are described in the [roadmap](ROADMAP.md).

## How scoring works

Every item has a time limit.

- A wrong answer or a timeout scores 0.
- A correct answer scores 60 points, plus up to 40 for speed: the full 40 for
  an instant answer, falling in a straight line to 0 at the time limit.
- The session score is the average over all items, from 0 to 100.

Accuracy is worth more than speed on purpose, so guessing quickly never beats
answering correctly. The rule lives in
[`src/core/scoring.ts`](src/core/scoring.ts).

## Your data

There are no accounts and no server. Finished sessions are saved in your
browser's `localStorage` and nowhere else; the app makes no network requests
after it has loaded. "Delete log" on the session log screen removes
everything.

## Built with

- [TypeScript](https://www.typescriptlang.org/) and [React](https://react.dev/)
- [Vite](https://vite.dev/) for the dev server and the build
- [Vitest](https://vitest.dev/) for unit tests
- [oxlint](https://oxc.rs/docs/guide/usage/linter) for linting
- [B612](https://b612-font.com/), the typeface designed for aircraft cockpit
  displays, bundled through [Fontsource](https://fontsource.org/)

No backend, no database, no analytics.

## Run it

You need [Node.js](https://nodejs.org/) 22.12 or newer.

```sh
npm install
npm run dev
```

Then open the address Vite prints (usually <http://localhost:5173>).

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server with hot reload. |
| `npm test` | Run the unit tests once. |
| `npm run test:watch` | Re-run tests as files change. |
| `npm run lint` | Lint the source. |
| `npm run typecheck` | Type-check without building. |
| `npm run check` | Lint, type-check and test. Run this before committing. |
| `npm run build` | Type-check and build the static site into `dist/`. |
| `npm run preview` | Serve the built site locally. |

### Deploying

The build is a static site with relative asset paths, so `dist/` can be served
from any host or subfolder. The included workflow publishes it to GitHub Pages
on every push to `main`; switch Pages on once under **Settings > Pages >
Source: GitHub Actions**.

## How the code is organised

```
src/
  core/        Framework-free logic, all unit-tested
    rng.ts         Seeded random numbers: a session can be replayed from its seed
    session.ts     Session state machine (question, feedback, finished)
    scoring.ts     Item and session scores
    sessionLog.ts  Saved results, with schema versioning and validation
    types.ts       The TrainingModule interface every drill implements
  modules/     One folder per drill, plus the registry
    arithmetic/
    headings/
    registry.ts
  screens/     Home (strip board), drill runner and results, session log
  app/         Hash routing, storage hook, formatting helpers
  components/  Shared UI
```

The design rule is that anything with a right answer lives in `core/` or in a
module's plain `.ts` files and has tests; React components only display state
and report input.

## Adding a drill

1. Create `src/modules/<id>/` with a generator that builds one item from the
   seeded RNG and the level index. Generators must be deterministic.
2. Add tests for the generator. Check the stored answers independently, as
   `arithmetic/generate.test.ts` does.
3. Write a view component that shows an item and calls `onAnswer`. When
   `locked` is true it must stop taking input and may reveal the solution.
4. Export a `TrainingModule` from `index.ts` and add it to
   `src/modules/registry.ts`.

The session runner, timing, scoring and the session log then work without
further changes, and the registry's contract tests cover the new module
automatically.

## Independence

This is an independent, personal project. It is not affiliated with, endorsed
by or connected to EUROCONTROL or any air navigation service provider.

FEAST is the selection test package developed by EUROCONTROL. This project
does not reproduce, imitate or include any item, layout, wording or scoring
from FEAST or any other official test. Every drill is an original
implementation of a general task (arithmetic, compass geometry) or of a
paradigm from the published psychology literature, and all items are generated
by the code in this repository. Contributions must follow the same rule.

A good score here says nothing about how you would do in a real selection.

## License

[MIT](LICENSE).

The B612 fonts are distributed under the
[SIL Open Font License 1.1](https://openfontlicense.org/) by their authors.
