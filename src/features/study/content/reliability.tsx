import type { StudyTopic } from "./types";

export const reliabilityTopic: StudyTopic = {
  id: "reliability",
  number: 6,
  title: "Reliability and trade-offs",
  sections: [
    {
      id: "stale-results",
      title: "Stale results can't win a race",
      sayThisAloud:
        "TanStack Query keys every read by its full filter object plus the current scenario version, so an old, slow response for a previous filter set is simply ignored when it finally arrives.",
      keywords: ["race condition", "abort signal", "query key"],
      body: (
        <>
          <p>
            <code>useProviders</code>/<code>useSlots</code> pass an <code>AbortSignal</code> straight into{" "}
            <code>repository.searchProviders</code>/<code>getSlots</code>, and the query key includes both the query
            object and <code>scenarioStore</code>'s version counter — changing a filter or applying a new scenario
            produces a new key, and React Query discards results that no longer match the latest active key rather
            than trying to reconcile arrival order.
          </p>
        </>
      ),
    },
    {
      id: "double-booking",
      title: "Preventing double booking",
      sayThisAloud:
        "The client can't prevent double booking on its own — only a server performing the availability check and the write as one atomic operation can. This demo simulates that boundary inside the mock repository.",
      body: (
        <>
          <p>
            <code>MockBookingRepository.book()</code> rechecks slot existence, appointment type, and overlap against{" "}
            <em>every</em> confirmed appointment for that provider — across all locations, modes, and appointment
            types, by comparing start/end intervals, not just slot ids — after its simulated delay, inside the same
            method call that performs the write. Disabling the Confirm button prevents accidental double-submission
            from one user; it cannot stop a second, different user from taking the same slot first. That guarantee
            needs a database-level constraint and a transaction, which is out of scope for a frontend demo.
          </p>
        </>
      ),
    },
    {
      id: "idempotency",
      title: "Idempotent retries vs. concurrency safety — two different problems",
      sayThisAloud:
        "Idempotency solves 'my own retry doesn't create a duplicate'; it does not solve 'two different people booked the same slot at once' — those need different mechanisms and are easy to conflate.",
      body: (
        <>
          <p>
            Every <code>book</code>/<code>reschedule</code>/<code>cancel</code> call carries a stable{" "}
            <code>idempotencyKey</code> generated once per draft. The repository stores{" "}
            <code>{"{ fingerprint, result }"}</code> keyed by that string; a repeat call with the same key AND the
            same fingerprint replays the cached result without re-executing the mutation. A repeat with the same key
            but a <em>different</em> fingerprint (a genuinely different request reusing an old key) is rejected as a
            <code>ValidationError</code>. A pre-commit failure (conflict, injected network failure) is never cached
            as a success, so a retry after one of those genuinely re-attempts the operation.
          </p>
          <p>
            What isn't implemented: recovering from a <em>lost response</em> to a request that actually succeeded
            server-side (the client would need to resolve the uncertain outcome via the same key or a status
            lookup, not assume failure and resubmit with new intent). I want to be explicit that this exact scenario
            is discussed, not built — the implemented fault (<code>network-failure-once</code>) fails{" "}
            <em>before</em> commit, which is a materially simpler case.
          </p>
        </>
      ),
    },
    {
      id: "reschedule-safety",
      title: "Reschedule safety",
      sayThisAloud:
        "Reschedule validates the new slot and the appointment's version, then swaps atomically inside one repository call — never cancel-then-hope-the-new-one-succeeds.",
      body: (
        <>
          <p>
            <code>reschedule()</code> checks <code>appointmentVersion</code> against the stored version first (a
            mismatch throws a recoverable <code>StaleAppointmentError</code>), validates the replacement slot the
            same way <code>book()</code> does, and only then updates the SAME appointment record's provider/location/
            mode/time/version in place. If any check fails, the original appointment is untouched — verified live in
            Phase 5 by rescheduling and confirming the old slot only frees up after success, never before.
          </p>
        </>
      ),
    },
    {
      id: "time-zones",
      title: "Time zones, DST, and cross-midnight grouping",
      keywords: ["timezone", "timezones", "dst", "daylight saving"],
      sayThisAloud:
        "Every slot resolves its own display zone — clinic zone for in-person, viewer's browser zone for virtual — because a single flat zone for a mixed-mode list is factually wrong the moment one provider offers both.",
      body: (
        <>
          <p>
            This was a real bug caught only by opening the running app: a single <code>displayZone</code> prop
            threaded through the whole slot list showed a Chicago clinic's 9:00 AM in Pacific time as "7:00 AM,"
            simply wrong. The fix (<code>src/features/booking/utils/zone.ts</code>) resolves zone per slot from{" "}
            <code>slot.mode</code>, and each radio option's label spells out time, zone abbreviation, mode, and
            location so genuinely distinct slots at the same visual time (different location/mode combinations) are
            never mistaken for duplicates.
          </p>
          <p>
            All slots are generated and stored as UTC ISO instants (<code>zonedWallTimeToIso</code> in{" "}
            <code>src/lib/zonedTime.ts</code>, backed by <code>date-fns-tz</code>); every screen formats through one
            shared helper (<code>src/lib/datetime.ts</code>) using <code>Intl.DateTimeFormat</code>, so a UTC offset
            is never hard-coded and DST transitions are handled by the platform's own timezone database rather than
            arithmetic in this codebase. Day-grouping in <code>SlotPicker</code> buckets by each slot's own zone's
            calendar date — a fixture set spanning a DST transition or local midnight groups correctly without a
            special case, though a dedicated automated DST fixture test is listed as a Topic 8/Phase 7 follow-up
            rather than already written.
          </p>
        </>
      ),
    },
    {
      id: "persistence",
      title: "Persistence boundaries",
      sayThisAloud:
        "Committed appointments and idempotency results persist to namespaced, versioned localStorage; drafts stay in memory only, and none of it is presented as secure or multi-device.",
      body: (
        <>
          <p>
            <code>src/lib/storage.ts</code> wraps every read/write with a namespace and a version number, so a
            future schema change can detect and discard incompatible old data instead of crashing on it; storage
            unavailability (private browsing, quota) degrades to in-memory-only rather than throwing. This is a
            local rehearsal convenience, not a claim of secure or cross-tab patient data storage.
          </p>
        </>
      ),
    },
    {
      id: "access-boundaries",
      title: "Access boundaries are demonstrated, not enforced",
      sayThisAloud:
        "Guest, patient, and staff each see a different appointment list, but that filtering happens inside the mock service, which is exactly where I'd point out that a real backend, not client-side filtering, has to be the actual authorization boundary.",
      body: (
        <>
          <p>
            <code>listAppointments(actor)</code> filters by <code>actor.kind</code>: staff see every practice
            appointment, a signed-in patient sees only their own <code>patientId</code>, and a guest sees only
            appointments whose <code>bookedByActor.sessionId</code> matches their current browser session. A guest
            reopening the app in a new tab, or clearing storage, loses access to that booking by design — the spec
            calls this out explicitly: a real guest-management pathway needs a protected link or a verification step,
            which is not implemented here.
          </p>
        </>
      ),
    },
    {
      id: "production-table",
      title: "Implemented here / would change in production / why",
      sayThisAloud:
        "None of these gaps are accidental — each is a deliberate simplification appropriate for a frontend rehearsal demo, and I can name the production replacement for every one.",
      body: (
        <>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-2">Implemented here</th>
                <th className="p-2">Would change in production</th>
                <th className="p-2">Why</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border align-top">
                <td className="p-2">Mock email-only sign-in, no password</td>
                <td className="p-2 text-text-muted">Real auth provider, session/token handling</td>
                <td className="p-2 text-text-muted">A real login is out of scope and would be misleading to fake convincingly.</td>
              </tr>
              <tr className="border-b border-border align-top">
                <td className="p-2">Client-side actor-based list filtering</td>
                <td className="p-2 text-text-muted">Server-enforced per-record authorization</td>
                <td className="p-2 text-text-muted">Only a trusted server can actually enforce access control.</td>
              </tr>
              <tr className="border-b border-border align-top">
                <td className="p-2">localStorage persistence</td>
                <td className="p-2 text-text-muted">Transactional database with real constraints</td>
                <td className="p-2 text-text-muted">Needed for cross-device access and real concurrency guarantees.</td>
              </tr>
              <tr className="border-b border-border align-top">
                <td className="p-2">Guest session scoped to sessionStorage</td>
                <td className="p-2 text-text-muted">Protected link or verification token</td>
                <td className="p-2 text-text-muted">A session id is not proof of identity or authorization.</td>
              </tr>
              <tr className="align-top">
                <td className="p-2">Deterministic, one-shot mock faults</td>
                <td className="p-2 text-text-muted">Real monitoring, retries, circuit breaking</td>
                <td className="p-2 text-text-muted">A demo needs reproducibility; production needs resilience under real load.</td>
              </tr>
            </tbody>
          </table>
        </>
      ),
    },
    {
      id: "appointment-requests",
      title: "Appointment requests as a different state machine",
      sayThisAloud:
        "If a practice requires staff approval instead of instant confirmation, that's a genuinely different lifecycle — submitted, pending, then confirmed or declined — not a tweak to this one.",
      body: (
        <>
          <p>
            A request receipt is not a confirmed appointment, and conflating the two would mislead a patient about
            whether they actually have a booked time. Implementing it would mean adding a <code>requested</code>{" "}
            status distinct from <code>confirmed</code>/<code>canceled</code>, a staff approval queue, and a
            notification step — left as a described extension rather than built, to keep this slice's lifecycle
            simple and demonstrable in minutes.
          </p>
        </>
      ),
    },
    {
      id: "measures",
      title: "What I'd actually measure",
      sayThisAloud:
        "Completion rate from eligible search to confirmation, stage abandonment, time-to-suitable-slot, staff task time, conflict frequency and recovery, duplicate bookings, and accessibility task success — with no numbers invented here.",
      body: (
        <p>
          Any of these needs a stated denominator and time window to mean anything (e.g. "% of started guest drafts
          that reach confirmation, per week"), and touching real patient behavior data raises privacy considerations
          that belong in a real analytics design review, not a client-side event schema sketched in this demo.
        </p>
      ),
    },
  ],
};
