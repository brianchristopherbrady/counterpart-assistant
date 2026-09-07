import type { StudyTopic } from "./types";

const OPENING_QUESTIONS: Array<{ ask: string; why: string }> = [
  {
    ask: "Who is doing the booking: the patient, practice staff, or both?",
    why: "Entry point, identity selection, information density, and permission boundary.",
  },
  {
    ask: "Are we helping new patients find care, or existing patients arrange a follow-up?",
    why: "Discovery versus continuity, eligibility, and how much detail can be prefilled.",
  },
  {
    ask: "Can people browse and book as guests? Where is authentication actually required?",
    why: "Public discovery, late gating, draft preservation, and appointment management access.",
  },
  {
    ask: "Do people usually care about a particular provider, or the earliest suitable time?",
    why: "Provider-first versus time-first results; the selected appointment model stays shared.",
  },
  {
    ask: "Are these confirmed bookings or requests the practice must approve?",
    why: "Final state and lifecycle. This build uses direct confirmation; approval is a separate extension.",
  },
  {
    ask: "Are available slots supplied by an existing scheduling system?",
    why: "Whether we consume bookable inventory or must design availability generation and integration.",
  },
  {
    ask: "What makes a slot eligible: visit type, duration, new-patient status, location, or visit mode?",
    why: "Search contract and validation rules.",
  },
  {
    ask: "Should rescheduling and cancellation be included in the first slice?",
    why: "Appointment lifecycle, reusable selection UI, and mutation semantics.",
  },
  {
    ask: "What happens when a displayed slot is no longer available?",
    why: "Server authority, conflict recovery, and preserving user effort.",
  },
  {
    ask: "Which components and patterns already exist, and what devices or accessibility needs matter most?",
    why: "Reuse strategy, layout, interaction behavior, and what warrants a new shared component.",
  },
  {
    ask: "What would make this successful: completed bookings, fewer calls, or faster staff scheduling?",
    why: "Evaluation and trade-offs; do not invent targets without a baseline.",
  },
];

export const startConversationTopic: StudyTopic = {
  id: "start-conversation",
  number: 1,
  title: "Start the conversation",
  sections: [
    {
      id: "opening-questions",
      title: "Opening questions and the choices they affect",
      sayThisAloud:
        "Before choosing the screens, I'd like to clarify who is booking and whether they already know the provider. I'll assume the scheduling system supplies eligible slots, then focus on discovery, confirmation, and recovery when availability changes. Does that match the scope you want?",
      keywords: ["clarifying questions", "ambiguous brief", "scope"],
      body: (
        <>
          <p>
            An ambiguous brief rewards asking a handful of scoping questions early, then making the rest of the
            assumptions explicit and moving into the work. Interrogating requirements for the whole session reads as
            stalling, not rigor — the goal is two or three real answers plus a short list of stated assumptions the
            other side can correct.
          </p>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-2">Ask</th>
                <th className="p-2">Why it changes the solution</th>
              </tr>
            </thead>
            <tbody>
              {OPENING_QUESTIONS.map((q) => (
                <tr key={q.ask} className="border-b border-border align-top">
                  <td className="p-2 font-medium text-text-primary">{q.ask}</td>
                  <td className="p-2 text-text-muted">{q.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>
            In this build, the answers landed as: both patients and staff book (with staff identifying the patient
            first); both new and returning patients are supported; guests can book, with a separate preset showing a
            late sign-in gate; provider-first and earliest-available are both implemented as discovery modes;
            bookings confirm directly (no approval queue); slots come from a mocked repository standing in for a
            real scheduling system; eligibility is visit type plus new/established status, location, and mode;
            reschedule and cancel are in scope from the first slice; a stale slot is a first-class, recoverable
            state, not an error page.
          </p>
        </>
      ),
    },
    {
      id: "assumed-scope",
      title: "Assumed scope and success criteria",
      sayThisAloud:
        "The scope is a small, deliberately narrow booking flow — six providers, two locations, two visit types — built to demonstrate frontend decisions, not a production scheduling system.",
      body: (
        <>
          <p>
            Care Booking models one fictional practice: two locations (Downtown Clinic and Northside Clinic, both in{" "}
            <code>America/Chicago</code>), six providers with different location/mode/new-patient combinations, three
            seeded patients, and two appointment types — a 30-minute new-patient visit and a 15-minute established
            follow-up. That is enough surface area to exercise every interaction pattern in the brief (discovery,
            identity, review, conflict, reschedule, cancel) without turning into a visual-design or backend-infra
            project.
          </p>
          <p>
            Success for a rehearsal demo isn't a business metric — it's whether I can narrate the trade-offs behind
            every screen, show a recovery path for every documented failure mode, and adapt the flow live when an
            interviewer changes a requirement (see the walkthroughs in Topic 3 and the requirement-change drills in
            Topic 7).
          </p>
        </>
      ),
    },
    {
      id: "session-agenda",
      title: "Adaptable session agenda",
      sayThisAloud:
        "A 60-minute rehearsal: 5 minutes scope, 10 happy path, 15 components and state, 15 failures and changing requirements, 10 accessibility/design-system/testing, 5 recap.",
      body: (
        <>
          <p>This is a practice agenda, not a confirmed interview duration — treat it as a scaffold to adapt:</p>
          <ul className="list-disc pl-6">
            <li>5 min — restate scope and the assumptions from the opening questions.</li>
            <li>10 min — happy path: guest new-patient booking end to end (Walkthrough 1).</li>
            <li>15 min — components and state ownership (Topic 4), pointing at real files as we go.</li>
            <li>15 min — a slot disappearing mid-booking, then a changed requirement (Walkthroughs 4–5).</li>
            <li>10 min — accessibility, design-system layering, and how it's tested (Topics 5 and 7).</li>
            <li>5 min — recap and open questions.</li>
          </ul>
          <p>
            If time is short, drop straight to the failures/changing-requirements block — it demonstrates more
            engineering judgment per minute than a clean happy path does. If there's extra time, go deeper on one
            topic (idempotency and conflict handling, or the FASTElement design-system boundary, are the two richest
            veins).
          </p>
        </>
      ),
    },
  ],
};
