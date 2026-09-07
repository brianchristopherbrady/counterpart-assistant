# Care Booking (demo)

A small, fictional care-booking product built as a UX Engineer interview-prep exercise. One
practice ("Care Booking"), two locations, six providers, three seeded patients, and two
appointment types — enough surface area to demonstrate real booking-flow decisions (identity,
idempotency, conflicts, faults, timezones) without pretending to be a real product. All data is
fictional and stored only in the browser (`localStorage`); nothing leaves the browser and no API
keys are required.

Alongside the product there's an in-app **Study guide** (`/study`) — eight topics, five Mermaid
diagrams, five interactive walkthroughs, and a live component gallery — written to explain the
actual decisions in this codebase, not generic advice.

## Getting started

Requires Node 20+ and Yarn (classic).

```bash
yarn install       # install dependencies
yarn dev           # start the app at http://localhost:5173
yarn storybook     # start Storybook at http://localhost:6006
```

## Scripts

| Command                | What it does                                                        |
| ----------------------- | -------------------------------------------------------------------- |
| `yarn dev`              | Vite dev server for the app.                                         |
| `yarn build`            | Type-checks (`tsc -b`) then produces a production build in `dist/`.  |
| `yarn preview`          | Serves the production build locally.                                 |
| `yarn typecheck`        | `tsc -b --noEmit` across the whole project.                          |
| `yarn lint`             | ESLint over the whole project.                                       |
| `yarn test`             | Unit/component tests (Vitest).                                       |
| `yarn test:watch`       | Vitest in watch mode.                                                |
| `yarn test:e2e`         | Playwright end-to-end tests. **Runs against `dist/`** — run `yarn build` first if you've changed source since the last build (`playwright.config.ts`'s `webServer` calls `yarn preview`). |
| `yarn storybook`        | Storybook dev server.                                                |
| `yarn build-storybook`  | Static Storybook build in `storybook-static/`.                       |

Recommended full check before considering any change "done":

```bash
yarn typecheck && yarn lint && yarn test && yarn build && yarn test:e2e && yarn build-storybook
```

## Scenarios

The **Scenarios** drawer (top-right of the app) lets you switch between four presets and inject
deterministic data faults, without touching code:

| Preset | What it demonstrates |
| --- | --- |
| **New patient** | A patient new to the practice browses as a guest, then books without creating an account. Bookings are scoped to that browser session only. |
| **Returning patient** | An established patient starts already signed in, with their details prefilled and a "usual provider" suggested (not mandatory). |
| **Staff booking** | Staff identify the patient first (search or register new); the patient's identity stays visible throughout, distinct from the staff member's own identity as the acting actor. |
| **Sign-in required** | Browsing and discovery stay open to everyone; a simulated sign-in is only required right before the booking is confirmed, and the in-progress draft resumes afterward. |

Each preset can be combined with:
- **Discovery mode**: choose a provider first, or see the earliest available slot across all
  eligible providers.
- **Patient booking access** (guest presets only): allow guest booking, or require sign-in.
- **Data scenario**: `Normal`, `No matching availability`, `Slot taken on submit` (a conflict on
  the first confirm attempt, recoverable on retry with a fresh slot), `Network failure once` (a
  transient failure recoverable by retrying the *same* action), `Slow response` (a fixed
  artificial delay to show pending/loading states).

**Reset demo data** clears every committed appointment made in this browser. Applying a new
scenario while a booking is in progress asks for confirmation before discarding the draft.

## Architecture entry points

- `src/domain/` — core types (`models.ts`), the repository contract (`repository.ts`), typed
  errors (`errors.ts`), eligibility rules (`eligibility.ts`), and scenario presets
  (`scenario.ts`). Start here to understand the data model.
- `src/data/` — `fixtures/` (the fictional locations/providers/patients/appointment types/slots)
  and `mockRepository.ts`, an in-memory + `localStorage`-persisted implementation of the
  repository contract: idempotency-key handling, slot-overlap conflict checks, and deterministic
  fault injection.
- `src/design-system/` — the shared UI primitives, built as real Web Components
  (`@microsoft/fast-element` + `@microsoft/fast-foundation`) rather than plain React, reflecting
  a genuine Web Components background. Each component lives under
  `elements/<name>/` split into class/template/styles/definition/registration files; a generic
  `react/createComponent.ts` wrapper exposes each one as an ordinary-looking React component.
  See `src/features/study/content/designSystem.tsx` for the full rationale, including the
  explicit trade-off of choosing this architecture for a from-scratch React app.
- `src/features/booking/` — the booking flow itself: `BookingFlow.tsx` orchestrates discovery →
  identity/sign-in → review → confirmation across all four scenario presets and reschedule mode.
- `src/features/appointments/` — listing, reschedule, and cancel.
- `src/features/scenarios/` — the Scenarios drawer described above.
- `src/features/study/` — the Study guide content and components.
- `src/lib/` — date/time formatting, including per-slot IANA timezone resolution
  (`utils/zone.ts`-equivalent logic in `booking/utils/zone.ts`) so in-person and virtual slots in
  the same list are never mislabeled by a single flat timezone assumption.

## Testing

- **Unit/component** (`yarn test`, Vitest): repository invariants (idempotency, slot-overlap
  conflicts across modes/locations, reschedule atomicity — a successful reschedule moves the
  same appointment id/reference and frees the original slot; a stale-version reschedule leaves
  the original completely untouched — cancel-releases-slot, `AbortSignal` cancellation) plus a
  DST/cross-midnight fixture test (`src/lib/datetime.test.ts`) pinned to real `America/Chicago`
  transition dates.
- **Storybook interaction tests** (`@storybook/test`, visible in each story's Interactions
  panel): keyboard slot selection, dialog focus behavior, and form validation. Note: these run
  against `@testing-library/dom`, which — unlike real Playwright — cannot see roles/text that
  live inside a Web Component's Shadow DOM unless the component reflects that role onto its own
  host element; the relevant stories assert through slotted text or reflected attributes instead
  where needed.
- **End-to-end** (`yarn test:e2e`, Playwright, against a production build): one spec per
  critical behavior — guest booking with session-scoped visibility, the sign-in-required late
  gate, returning-patient prefill, staff actor-vs-subject, conflict recovery, idempotent retry
  after an injected failure, and the full reschedule/cancel occupancy lifecycle (including a
  failed reschedule that must leave the original appointment untouched).

## Known, intentional limitations

- **Not a real backend.** All data lives in this browser's `localStorage`; there is no server,
  no real authentication, and no cross-device sync. "Sign-in" only checks that an email matches
  a seeded/registered patient record — there is no password check.
- **Simulated latency.** Every mock-repository call has a fixed ~300ms artificial delay to make
  loading states visible/demoable. This is a deliberate demo choice, not a real network.
- **Accessibility coverage is Storybook's default axe-core ruleset** (via `addon-a11y`,
  axe-core 4.13 at time of writing) with no custom rule configuration — this catches common WCAG
  2.0 A/AA issues per story but is not a substitute for a full manual accessibility audit.
- **Bundle size.** Several Mermaid diagram-type chunks and a few app chunks exceed Vite's 500KB
  warning threshold after minification (see the `yarn build` output). They're already
  lazy-loaded (Mermaid only loads on the Study route) and code-splitting further wasn't a goal
  of this exercise, so this is left as a known, visible trade-off rather than "fixed" silently.
- **Two locations, six providers, three patients, two appointment types** — deliberately small
  per the exercise's own scope guidance; the Study guide's content is the actual point of
  depth, not a larger product surface.
