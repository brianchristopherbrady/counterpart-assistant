import type { StudyTopic } from "./types";

export const flowDecisionsTopic: StudyTopic = {
  id: "flow-decisions",
  number: 2,
  title: "Flow decisions",
  sections: [
    {
      id: "personas",
      title: "Personas and scenario mapping",
      sayThisAloud:
        "Four presets cover the actual variation in this brief: a new guest patient, a returning signed-in patient, staff booking on someone's behalf, and a patient who must sign in only at the very end.",
      keywords: ["scenarios drawer", "presets", "new patient", "returning patient", "staff booking", "sign-in required"],
      body: (
        <>
          <p>
            The Scenarios drawer (<code>src/features/scenarios/ScenariosDrawer.tsx</code>) exposes exactly these
            four named presets, built from one typed <code>ScenarioConfig</code> discriminated union (
            <code>src/domain/scenario.ts</code>) so an invalid combination — like a staff actor with a guest
            sign-in policy — can't be constructed:
          </p>
          <ul className="list-disc pl-6">
            <li>
              <strong>New patient</strong> — patient actor, new to the practice, guest booking allowed, provider-first
              discovery.
            </li>
            <li>
              <strong>Returning patient</strong> — patient actor, established, starts already signed in, usual
              provider suggested (not mandatory).
            </li>
            <li>
              <strong>Staff booking</strong> — staff actor, identifies an existing or new patient first,
              earliest-available discovery by default.
            </li>
            <li>
              <strong>Sign-in required</strong> — patient actor, new to the practice, starts signed out, gated at
              final submission rather than at discovery.
            </li>
          </ul>
          <p>
            Three small overrides (discovery mode, guest-booking policy, data scenario) apply on top of a preset via
            an explicit "Apply scenario" action, never scattered through component conditionals — every screen reads
            actor/context from <code>useScenarioStore</code> and <code>useSessionStore</code>, not from a preset
            name.
          </p>
        </>
      ),
    },
    {
      id: "documented-patterns",
      title: "Documented product patterns behind each decision",
      sayThisAloud:
        "Every non-obvious decision traces to a documented pattern from an existing product, not a guess — Zocdoc's discovery-before-identity, NHS's recoverable stale-slot flow, and GOV.UK's check-answers pattern all show up directly in this build.",
      body: (
        <>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-2">Source</th>
                <th className="p-2">Decision in this build</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border align-top">
                <td className="p-2 font-medium">Zocdoc</td>
                <td className="p-2 text-text-muted">
                  Provider results (<code>ProviderResults.tsx</code>) show specialty, locations, modes, and real
                  fixture availability before any identity is collected.
                </td>
              </tr>
              <tr className="border-b border-border align-top">
                <td className="p-2 font-medium">MyChart</td>
                <td className="p-2 text-text-muted">
                  Patient status (new/established) and account status (guest/signed-in) are separate fields on{" "}
                  <code>ScenarioConfig</code>, not one flag — an established patient can still book as a guest.
                </td>
              </tr>
              <tr className="border-b border-border align-top">
                <td className="p-2 font-medium">NHS booking help</td>
                <td className="p-2 text-text-muted">
                  A taken slot is a <code>SlotConflictError</code>, not a crash — <code>BookingFlow</code> clears the
                  stale selection, refreshes alternatives, and keeps entered details.
                </td>
              </tr>
              <tr className="border-b border-border align-top">
                <td className="p-2 font-medium">NHS appointment configuration</td>
                <td className="p-2 text-text-muted">
                  Slots carry an <code>appointmentTypeId</code> and are filtered by patient context — not every gap
                  on a provider's calendar is offered to every patient.
                </td>
              </tr>
              <tr className="border-b border-border align-top">
                <td className="p-2 font-medium">Calendly (time zones)</td>
                <td className="p-2 text-text-muted">
                  Every slot label states its own zone; in-person defaults to the clinic zone, virtual to the
                  viewer's (<code>src/features/booking/utils/zone.ts</code>).
                </td>
              </tr>
              <tr className="border-b border-border align-top">
                <td className="p-2 font-medium">Calendly (scheduling FAQ)</td>
                <td className="p-2 text-text-muted">
                  Appointments page (<code>AppointmentsPage.tsx</code>) gives every confirmed booking working
                  Reschedule/Cancel actions, not just a static confirmation.
                </td>
              </tr>
              <tr className="border-b border-border align-top">
                <td className="p-2 font-medium">Acuity Help Center</td>
                <td className="p-2 text-text-muted">
                  <code>StaffPatientLookup.tsx</code> resolves the patient before discovery and keeps a persistent
                  "Booking for [name]" banner distinct from the acting staff actor.
                </td>
              </tr>
              <tr className="align-top">
                <td className="p-2 font-medium">GOV.UK check answers</td>
                <td className="p-2 text-text-muted">
                  <code>BookingReview.tsx</code> shows a row per decision with a specific "Change" action per row,
                  not one generic "edit" link.
                </td>
              </tr>
            </tbody>
          </table>
        </>
      ),
    },
    {
      id: "requirement-to-component",
      title: "Why a requirement changes a particular part of the app",
      sayThisAloud:
        "Because the layers are separated — domain, repository, draft state, and presentation — most requirement changes touch exactly one of them, which is the whole point of the architecture.",
      body: (
        <>
          <p>
            "Staff booking asks for the patient first and keeps their identity visible" is implemented as: {" "}
            <code>BookingFlow</code> gates on <code>actor.kind === "staff" &amp;&amp; !draft.subject</code> before
            anything else renders, and a small banner renders whenever both are true. No other component needed to
            change — <code>DiscoveryStep</code>, <code>BookingReview</code>, and the repository are actor-agnostic.
            That's the concrete link between "a requirement changes the actor model" and "exactly one gate in one
            orchestrating component changes."
          </p>
          <p>
            Contrast that with "add insurance filtering" (deliberately out of scope): it would need a new field on{" "}
            <code>ProviderQuery</code>/<code>Provider</code>, a filter control in <code>BookingFilters</code>, and a
            real coverage-verification integration — three layers, because it's genuinely new domain data, not a
            recomposition of existing actors.
          </p>
        </>
      ),
    },
  ],
};
