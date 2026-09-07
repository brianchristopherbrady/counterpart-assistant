import { Diagram } from "../components/Diagram";
import type { StudyTopic } from "./types";

const ENTRY_FLOW = `flowchart TD
  E["Booking entry (BookingFlow)"] --> A{"Actor?"}
  A -->|Patient| D["Discover provider or time (DiscoveryStep)"]
  A -->|Staff| P["Identify patient (StaffPatientLookup)"]
  P --> D
  D --> I["Resolve booking identity (GuestDetailsForm / PatientSignInForm)"]
  I --> R["Review appointment (BookingReview)"]
  R --> C{"Commit result?"}
  C -->|Booked| S["Confirmation (BookingConfirmation)"]
  C -->|Conflict| T["Choose another time"]
  T --> D`;

const COMPOSITION = `flowchart TD
  S["Scenario configuration (scenarioStore)"] --> F["Booking composition (BookingFlow)"]
  F --> P["Provider and slot patterns (ProviderResults, SlotPicker, EarliestAvailableList)"]
  F --> Q["Draft reducer (bookingDraftStore)"]
  P --> U["Shared accessible UI (design-system/react)"]
  U --> T["Semantic tokens (tokens.css)"]
  F --> H["Async resource hooks (useProviders, useSlots)"]
  H --> R["Repository contract (BookingRepository)"]
  R --> M["Mock data adapter (MockBookingRepository)"]`;

const COMMIT_SEQUENCE = `sequenceDiagram
  participant U as User
  participant UI as BookingReview
  participant R as MockBookingRepository
  participant D as Canonical store
  U->>UI: Confirm selected time
  UI->>R: book(input, actor, idempotencyKey)
  R->>D: Check prior idempotency result and slot eligibility
  alt Available
    R->>D: Commit appointment and idempotency result together
    R-->>UI: Confirmed appointment
    UI-->>U: Confirmation
  else Taken
    R-->>UI: SlotConflictError
    UI->>R: getSlots (refresh)
    R-->>UI: Current eligible slots
    UI-->>U: Keep details, choose another time
  end`;

const BOOKING_STATE = `stateDiagram-v2
  [*] --> discovery
  discovery --> identity: continue (new subject)
  discovery --> review: continue (subject already known)
  identity --> signin: sign-in required
  identity --> review: sign-in not required
  signin --> review: signed in
  review --> submitting: confirm
  submitting --> confirmed: success
  submitting --> conflict: SlotConflictError
  submitting --> error: other recoverable error
  conflict --> discovery: choose another time
  error --> review: retry
  confirmed --> [*]`;

const ENTITY_RELATIONSHIP = `erDiagram
  PROVIDER ||--o{ SLOT : offers
  LOCATION ||--o{ SLOT : hosts
  APPOINTMENTTYPE ||--o{ SLOT : constrains
  PROVIDER ||--o{ APPOINTMENT : "is booked with"
  PATIENT ||--o{ APPOINTMENT : "may be subject of"
  SLOT ||--o| APPOINTMENT : "becomes, on booking"`;

export const architectureTopic: StudyTopic = {
  id: "architecture",
  number: 4,
  title: "Frontend architecture",
  sections: [
    {
      id: "state-ownership",
      title: "State ownership",
      sayThisAloud:
        "Four kinds of state, four different owners — mixing them (e.g. keeping a selected slot in the URL, or provider data in a reducer) is exactly the bug class React's state-structure guidance warns about.",
      keywords: ["state management", "zustand", "tanstack query"],
      body: (
        <>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-2">Kind</th>
                <th className="p-2">Examples</th>
                <th className="p-2">Owner</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border align-top">
                <td className="p-2 font-medium">Search/navigation</td>
                <td className="p-2 text-text-muted">Selected day tab, active filters</td>
                <td className="p-2 text-text-muted">Local component state (SlotPicker's day tab) or draft filters</td>
              </tr>
              <tr className="border-b border-border align-top">
                <td className="p-2 font-medium">Server-like data</td>
                <td className="p-2 text-text-muted">Providers, slots, appointments</td>
                <td className="p-2 text-text-muted">
                  TanStack Query (<code>useProviders</code>, <code>useSlots</code>, <code>useAppointments</code>) over{" "}
                  <code>repository</code>
                </td>
              </tr>
              <tr className="border-b border-border align-top">
                <td className="p-2 font-medium">Draft/UI state</td>
                <td className="p-2 text-text-muted">Selected provider/slot, stage, form input</td>
                <td className="p-2 text-text-muted">
                  <code>useBookingDraftStore</code> (zustand) + local component state for pure UI toggles
                </td>
              </tr>
              <tr className="align-top">
                <td className="p-2 font-medium">Preparation state</td>
                <td className="p-2 text-text-muted">Active preset, injected fault, preparation-nav visibility</td>
                <td className="p-2 text-text-muted">
                  <code>useScenarioStore</code>, <code>usePreparationStore</code> — outside the product domain
                </td>
              </tr>
            </tbody>
          </table>
          <p>
            The booking draft was deliberately promoted from a component-local <code>useReducer</code> to a zustand
            store partway through the build, once the Scenarios drawer needed to inspect and discard it from outside{" "}
            <code>BookingFlow</code>'s component tree — a plain reducer can't be reached from a sibling component.
            Patient/DOB/contact data never enters the URL; only ids do, and the draft resolves full records through
            the repository.
          </p>
        </>
      ),
    },
    {
      id: "domain-model",
      title: "Domain model",
      sayThisAloud:
        "Provider, Slot, Appointment, and Patient are related but distinct — a slot becoming an appointment doesn't collapse their identities, and canceled appointments stay in history without consuming capacity.",
      body: (
        <>
          <Diagram
            title="Entity relationships"
            definition={ENTITY_RELATIONSHIP}
            caption="A frontend model like this documents intent; it does not itself provide a database uniqueness guarantee — that still needs a real backend constraint (Topic 6)."
          />
          <p>
            Types live in <code>src/domain/models.ts</code>: <code>Provider</code>, <code>Location</code>,{" "}
            <code>AppointmentType</code>, <code>Slot</code>, <code>Patient</code>, <code>ActorContext</code>,{" "}
            <code>BookingDraft</code>, and <code>Appointment</code> — plus <code>ScenarioConfig</code> in{" "}
            <code>scenario.ts</code>. <code>ActorContext</code> is a discriminated union (guest/patient/staff) kept
            deliberately separate from <code>BookingSubject</code> (the person the appointment is actually for), so
            staff-booking-for-someone-else is representable without a special case anywhere else in the app.
          </p>
        </>
      ),
    },
    {
      id: "component-boundaries",
      title: "Component boundaries",
      sayThisAloud:
        "SlotPicker is deliberately dumb: it takes slots, a selection, and a callback, and knows nothing about fetching, scenarios, or booking — that boundary is what lets it appear in both the provider-first and reschedule flows unchanged.",
      body: (
        <>
          <p>
            Its real prop shape (<code>src/features/booking/components/SlotPicker.tsx</code>):
          </p>
          <pre className="overflow-x-auto rounded-md bg-surface-sunken p-3 text-xs">
            {`interface SlotPickerProps {
  slots: Slot[];
  selectedSlotId?: string;
  zoneForSlot: (slot: Slot) => string;
  status: "pending" | "error" | "success";
  onSelect: (slotId: string) => void;
}`}
          </pre>
          <p>
            No fetching, no scenario labels, no booking calls. <code>DiscoveryStep</code> owns the query hooks and
            passes resolved data down; <code>BookingFlow</code> owns which stage renders. This mirrors the layering
            described in Topic 5: accessible behavior (the underlying FASTElement radio group), shared styled
            component (<code>RadioGroup</code> React wrapper), then a domain pattern (<code>SlotPicker</code>) built
            from it — domain assumptions never leak into the shared layer underneath.
          </p>
        </>
      ),
    },
    {
      id: "service-contract",
      title: "Service contract",
      sayThisAloud:
        "BookingRepository is the one seam between UI and data — swapping the mock adapter for a real HTTP client wouldn't touch a single component.",
      body: (
        <>
          <p>
            The illustrative HTTP mapping for the actual methods implemented in{" "}
            <code>src/domain/repository.ts</code> / <code>src/data/mockRepository.ts</code>:
          </p>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-2">Method</th>
                <th className="p-2">Illustrative HTTP</th>
                <th className="p-2">Notable status codes</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border align-top">
                <td className="p-2 font-mono text-xs">searchProviders</td>
                <td className="p-2 text-text-muted">GET /providers?type=&amp;location=&amp;mode=&amp;q=</td>
                <td className="p-2 text-text-muted">200</td>
              </tr>
              <tr className="border-b border-border align-top">
                <td className="p-2 font-mono text-xs">getSlots</td>
                <td className="p-2 text-text-muted">GET /slots?providerId=&amp;type=&amp;date=</td>
                <td className="p-2 text-text-muted">200</td>
              </tr>
              <tr className="border-b border-border align-top">
                <td className="p-2 font-mono text-xs">book</td>
                <td className="p-2 text-text-muted">
                  POST /appointments (Idempotency-Key header = idempotencyKey)
                </td>
                <td className="p-2 text-text-muted">201 booked · 409 SlotConflictError · 422 ValidationError</td>
              </tr>
              <tr className="border-b border-border align-top">
                <td className="p-2 font-mono text-xs">reschedule</td>
                <td className="p-2 text-text-muted">
                  PATCH /appointments/:id (If-Match: version)
                </td>
                <td className="p-2 text-text-muted">200 updated · 409 conflict/stale · 404 not found</td>
              </tr>
              <tr className="align-top">
                <td className="p-2 font-mono text-xs">cancel</td>
                <td className="p-2 text-text-muted">POST /appointments/:id/cancel</td>
                <td className="p-2 text-text-muted">200 canceled · 409 stale</td>
              </tr>
            </tbody>
          </table>
          <p>
            This is a proposed integration boundary for a real backend, not Counterpart's actual API — I have no
            visibility into that. The mock adapter's <code>ScenarioReader</code> callback and simulated latency are
            exactly where a real fetch client would sit instead.
          </p>
        </>
      ),
    },
    {
      id: "booking-lifecycle-diagrams",
      title: "Booking entry, composition, and commit diagrams",
      sayThisAloud:
        "The entry flowchart, the composition diagram, and the commit sequence together show how one draft moves from actor resolution through a recoverable conflict to confirmation.",
      body: (
        <div className="flex flex-col gap-4">
          <Diagram
            title="Booking entry flow"
            definition={ENTRY_FLOW}
            caption="Staff detour through patient identification; everyone converges on the same review/commit path."
          />
          <Diagram
            title="Composition"
            definition={COMPOSITION}
            caption="Scenario configuration flows one direction into booking composition; the repository is the only data seam."
          />
          <Diagram
            title="Commit sequence"
            definition={COMMIT_SEQUENCE}
            caption="A conflict refreshes alternatives and keeps the user's entered details, per the NHS-style recovery pattern."
          />
          <Diagram
            title="Booking state machine"
            definition={BOOKING_STATE}
            caption="New identity adds the identity/signin stages; an already-known subject (returning patient, staff) skips straight to review."
          />
        </div>
      ),
    },
  ],
};
