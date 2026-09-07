import type { StudyTopic } from "./types";

export const interviewPracticeTopic: StudyTopic = {
  id: "interview-practice",
  number: 7,
  title: "Interview practice",
  sections: [
    {
      id: "q1",
      title: "1. Where would you start with this ambiguous brief?",
      sayThisAloud:
        "Identify the actor, task, and outcome; agree a minimal happy path and two meaningful failures; state one assumption and invite correction before touching components.",
      body: <p>See Topic 1's opening-questions table for the actual list used and how each answer changed this build.</p>,
    },
    {
      id: "q2",
      title: "2. How does staff booking differ from patient booking?",
      sayThisAloud:
        "Staff must choose and retain the patient's identity first; everything downstream — slot selection, review, the repository call — is the same code path with a different actor on the Appointment record.",
      body: (
        <p>
          <code>StaffPatientLookup</code> gates <code>BookingFlow</code> before discovery; once{" "}
          <code>draft.subject</code> is set, the same <code>DiscoveryStep</code>/<code>BookingReview</code> render.
          See Walkthrough 3.
        </p>
      ),
    },
    {
      id: "q3",
      title: "3. Would you require an account?",
      sayThisAloud:
        "Browsing, booking identity, and later access to private appointments are three separate concerns — guest booking is allowed by default, and an account requirement (the sign-in-required preset) only gates the final submission, never discovery.",
      body: <p>See Walkthrough 5 and the "sign-in-required" preset in Topic 2.</p>,
    },
    {
      id: "q4",
      title: "4. Provider first or time first?",
      sayThisAloud:
        "It depends on whether continuity or speed matters more; both converge on the same draft, because DiscoveryStep just renders a different component (ProviderResults+SlotPicker vs. EarliestAvailableList) for the same discoveryMode field.",
      body: <p>See the composition diagram in Topic 4 and the discoveryMode toggle staff can use inline.</p>,
    },
    {
      id: "q5",
      title: "5. What belongs in the shared design system?",
      sayThisAloud:
        "Generic behavior, tokens, and broadly reusable controls — a SlotPicker can be a shared domain pattern, but provider eligibility rules never belong in a generic RadioGroup.",
      body: <p>See the three-layer composition rule in Topic 5.</p>,
    },
    {
      id: "q6",
      title: "6. How would you design a component API?",
      sayThisAloud:
        "Start from the states a consumer actually needs, then define controlled value/event/variant props and explicit loading/error semantics — SlotPicker's real four-prop interface is a working example.",
      body: <p>See the Component boundaries section of Topic 4 for SlotPicker's actual prop shape.</p>,
    },
    {
      id: "q7",
      title: "7. Why aren't Tailwind or a component kit the entire design system?",
      sayThisAloud:
        "They implement styling and behavior; a maintained system also needs semantic decisions, documented APIs, accessibility expectations, and a contribution/versioning process.",
      body: <p>See the Governance section of Topic 5.</p>,
    },
    {
      id: "q8",
      title: "8. How do tokens help here?",
      sayThisAloud:
        "One CSS custom-property source expresses intent (surface, action, status) once and reaches both Tailwind and every Shadow-DOM component, which is why the accent/density demo in Topic 5 can change real components live.",
      body: <p>See the Token layers section and the live Component gallery in Topic 5.</p>,
    },
    {
      id: "q9",
      title: "9. Where should state live?",
      sayThisAloud:
        "Shared data behind the repository via TanStack Query, draft state in a lifted zustand store, transient UI toggles locally, non-sensitive search state in the draft's filters — never copied or duplicated across layers.",
      body: <p>See the State ownership table in Topic 4.</p>,
    },
    {
      id: "q10",
      title: "10. What if a slower old request finishes last?",
      sayThisAloud:
        "Key every read by its full query plus the current scenario version, and let the query library discard results that no longer match the latest key — a debounce alone doesn't solve response ordering.",
      body: <p>See Stale results in Topic 6.</p>,
    },
    {
      id: "q11",
      title: "11. How do you prevent double booking?",
      sayThisAloud:
        "The server must perform the availability check and the write atomically; this demo simulates that boundary inside the mock repository's overlap check across all locations/modes/types for a provider.",
      body: <p>See Preventing double booking in Topic 6.</p>,
    },
    {
      id: "q12",
      title: "12. What does idempotency solve?",
      sayThisAloud:
        "A repeated, unchanged request reuses its result instead of creating a duplicate; it does not itself stop two different people from booking the same slot — that's a separate concurrency guarantee.",
      body: <p>See Idempotent retries vs. concurrency safety in Topic 6.</p>,
    },
    {
      id: "q13",
      title: "13. What if the booking succeeds but the response is lost?",
      sayThisAloud:
        "A production client would need to resolve that uncertainty via the same idempotency key or a status lookup, not assume failure and submit new intent — this exact case is discussed, not implemented, in this build.",
      body: <p>See the explicit callout in Idempotent retries vs. concurrency safety, Topic 6.</p>,
    },
    {
      id: "q14",
      title: "14. Would you optimistically update this flow?",
      sayThisAloud:
        "Selection feedback can be immediate, but booking confirmation waits for the authoritative repository result — the consequence of a misleading confirmation justifies that boundary.",
      body: <p><code>BookingReview</code> shows a pending state on Confirm but never renders a confirmed screen until the mutation resolves.</p>,
    },
    {
      id: "q15",
      title: "15. How do you reschedule safely?",
      sayThisAloud:
        "Validate the appointment's version and the new slot, then swap in one atomic repository call — never cancel first and hope the replacement succeeds.",
      body: <p>See Reschedule safety in Topic 6 and Walkthrough 2.</p>,
    },
    {
      id: "q16",
      title: "16. How would you make date/slot selection accessible?",
      sayThisAloud:
        "A labeled native radio group beats a custom calendar widget here — keyboard selection, a programmatic label that includes the zone, and focus/error handling all come nearly free from that choice.",
      body: <p>SlotPicker's options render through the RadioGroup design-system component, with time+zone+mode+location in every option's accessible name.</p>,
    },
    {
      id: "q17",
      title: "17. How do you handle responsiveness and density?",
      sayThisAloud:
        "Compose layouts to the available space and preserve DOM order; the compact-density token variant changes spacing and control size, never removes a label or shrinks a target below usability.",
      body: <p>See the density toggle in the Component gallery, Topic 5 — it swaps a CSS class, not markup.</p>,
    },
    {
      id: "q18",
      title: "18. How do you validate a shared component?",
      sayThisAloud:
        "Typed contracts, representative Storybook stories across real states, an accessibility addon pass, and manual keyboard/zoom inspection together — not one snapshot of the whole DOM tree.",
      body: <p>See Responsive behavior and Storybook in Topic 5.</p>,
    },
    {
      id: "q19",
      title: "19. How does your Web Components experience translate to this role?",
      sayThisAloud:
        "Shared semantics, stable APIs, and accessibility responsibilities carry across frameworks — I used that background directly in this repo's design-system layer, while keeping React natural everywhere else.",
      body: (
        <p>
          This is the one place in the app where I deliberately deviated from what I'd tell a team by default (React
          components, per the spec's own guidance) to demonstrate transferable experience — see Why the shared layer
          is Web Components in Topic 5 for the honest framing of that trade-off.
        </p>
      ),
    },
    {
      id: "q20",
      title: "20. How would you collaborate and use AI responsibly in this work?",
      sayThisAloud:
        "Make assumptions visible, prototype uncertain interactions, and validate generated code against real running behavior — several bugs in this exact build (see Topic 6 and Topic 8) were only caught by actually opening the app, not by trusting green tests alone.",
      body: (
        <p>
          Concretely: the per-slot timezone bug, the stale-draft-after-success bug, and the seed-patient eligibility
          bug were all invisible to typecheck/lint/unit tests and only surfaced in a real browser session — engineer
          judgment about what to verify live, not just what compiles, remained the human responsibility throughout.
        </p>
      ),
    },
    {
      id: "requirement-drills",
      title: "Requirement-change drills",
      sayThisAloud:
        "Four quick drills on requirements that were explicitly out of scope for this build, each with a concrete answer for what would change and what stays reusable.",
      body: (
        <div className="flex flex-col gap-3">
          <p>
            <strong>Guest access removed (sign-in always required):</strong> the sign-in-required preset already
            demonstrates the late-gate shape; removing guest entirely would just make <code>requireSignInToBook</code>{" "}
            unconditional. <code>DiscoveryStep</code>, <code>SlotPicker</code>, and the repository don't change at
            all — only the scenario config and the guest-policy override disappear from the drawer.
          </p>
          <p>
            <strong>Earliest appointment prioritized over provider choice:</strong> already implemented as the{" "}
            earliest-available discovery mode; making it the sole default is a one-line change to{" "}
            <code>DEFAULT_OVERRIDES_BY_PRESET</code>, not a new component.
          </p>
          <p>
            <strong>A request/approval model instead of instant confirmation:</strong> a genuinely new state machine
            (submitted → pending → confirmed/declined per Topic 6) — <code>BookingReview</code> and{" "}
            <code>BookingConfirmation</code> would need a "pending" rendering, and the repository would need a staff
            approval mutation; the domain model, discovery, and slot selection all stay reusable.
          </p>
          <p>
            <strong>Availability supplied by an external EHR:</strong> only <code>MockBookingRepository</code> and
            <code>src/data/repository.ts</code>'s singleton wiring change — every hook, component, and the{" "}
            <code>BookingRepository</code> interface itself stay exactly as they are, since that interface is the
            deliberate integration seam described in Topic 4.
          </p>
        </div>
      ),
    },
  ],
};
