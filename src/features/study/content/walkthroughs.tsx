import { WalkthroughCard } from "../components/WalkthroughCard";
import type { StudyTopic } from "./types";

export const walkthroughsTopic: StudyTopic = {
  id: "walkthroughs",
  number: 3,
  title: "Walk through the app",
  sections: [
    {
      id: "walkthroughs-list",
      title: "Five annotated rehearsals",
      sayThisAloud:
        "Each walkthrough loads a real scenario preset through the same store the Scenarios drawer uses, so nothing here is staged separately from the actual app.",
      keywords: ["load scenario", "rehearsal", "demo"],
      body: (
        <div className="flex flex-col gap-4">
          <WalkthroughCard
            number={1}
            goal="New patient books without an account"
            presetId="new-patient"
            route="/book"
            steps={[
              { action: "Browse providers with no filters applied.", expected: "four providers listed (the two that don't accept new patients are excluded)", component: "ProviderResults" },
              { action: 'Select a provider, then a time.', expected: "the day-grouped radio list, each option labeled with time, zone, mode, and location", component: "SlotPicker" },
              { action: "Continue, fill name/DOB/email, Continue to review.", expected: "no account was created or required", component: "GuestDetailsForm" },
              { action: "Confirm booking.", expected: "a reference and a link to Appointments, scoped to this browser session", component: "BookingConfirmation" },
              { action: "Open Appointments.", expected: "only this session's guest booking is visible", component: "AppointmentsPage" },
            ]}
            sayThisAloud="Identity comes after discovery on purpose — nothing here required an account, and guest access is an unverified booking identity, not a portal login."
            followUp="What stops someone from viewing another guest's booking by guessing a reference?"
            tradeoff="The mock repository scopes guest visibility to a session id kept in sessionStorage — a real implementation would need a protected link or verification step, discussed in Topic 6."
          />
          <WalkthroughCard
            number={2}
            goal="Returning patient changes an appointment"
            presetId="returning-patient"
            route="/appointments"
            steps={[
              { action: "Open Appointments.", expected: "Jordan Blake's appointment, already signed in, no login step", component: "AppointmentsPage" },
              { action: "Click Reschedule.", expected: "the visit type is locked; provider and time are free to change", component: "BookingFlow (reschedule mode)" },
              { action: "Pick a different provider and time, Continue.", expected: '"Rescheduling from [original time]" banner; original stays booked', component: "BookingReview" },
              { action: "Confirm reschedule.", expected: "same reference, updated provider/time; the original slot is free again", component: "useRescheduleAppointment" },
            ]}
            sayThisAloud="The original booking stays intact until the replacement actually succeeds — reschedule is a same-operation swap, not cancel-then-rebook."
            followUp="What happens if the version number in appointmentVersion doesn't match on submit?"
            tradeoff="A stale version throws a recoverable StaleAppointmentError instead of silently overwriting a concurrent change — see Topic 6."
          />
          <WalkthroughCard
            number={3}
            goal="Staff books for another person"
            presetId="staff-booking"
            route="/book"
            steps={[
              { action: "Search “Jordan” in the patient lookup.", expected: "Jordan Blake found by name/email/DOB match", component: "StaffPatientLookup" },
              { action: "Select Jordan Blake.", expected: '"Booking for Jordan Blake (1988-04-12)" banner appears', component: "BookingFlow" },
              { action: "Browse earliest-available times.", expected: "providers who don't accept new patients ARE included, since Jordan is established", component: "EarliestAvailableList" },
              { action: "Pick a time, Continue.", expected: "review skips the guest details step entirely — identity was already resolved", component: "BookingReview" },
              { action: "Confirm booking.", expected: "the appointment records staff as the booking actor and Jordan as the subject", component: "Appointment.bookedByActor" },
            ]}
            sayThisAloud="Actor and subject are separate fields on the domain model — the same review and repository code path serves both a patient booking for themselves and staff booking for someone else."
            followUp="Could a staff member overbook a provider by mistake?"
            tradeoff="No — the repository rechecks overlap at commit time regardless of who the actor is; staff still can't bypass provider/slot rules."
          />
          <WalkthroughCard
            number={4}
            goal="A time disappears during confirmation"
            presetId="new-patient"
            overrides={{ dataScenario: "slot-taken-on-submit" }}
            route="/book"
            steps={[
              { action: "Book a provider/time/guest details as in Walkthrough 1.", expected: "review looks identical to the happy path", component: "BookingReview" },
              { action: "Confirm booking.", expected: '"That time was just taken. Please choose another." — back at discovery, details preserved', component: "SlotConflictError handling" },
              { action: "Pick a different time, Continue, Confirm again.", expected: "succeeds — the fault only fires once per scenario activation", component: "MockBookingRepository" },
            ]}
            sayThisAloud="Selecting a slot is not a reservation — only the repository's commit-time recheck is authoritative, and losing a race there is a normal, recoverable outcome, not a bug."
            followUp="Why not just disable the button after selection to prevent this?"
            tradeoff="Disabling the button prevents double-submission from this user, but can't stop a genuinely different user from taking the same slot first — that needs server-side recheck-at-commit, which is what's implemented here."
          />
          <WalkthroughCard
            number={5}
            goal="The interviewer changes the requirement"
            presetId="sign-in-required"
            route="/book"
            steps={[
              { action: "Browse providers and times with no sign-in.", expected: "discovery is identical to the guest preset — browsing is never gated", component: "DiscoveryStep" },
              { action: "Fill guest details, Continue to review.", expected: 'a "Demo sign-in" step appears BEFORE review, not before browsing', component: "PatientSignInForm" },
              { action: "Sign in with any other email, e.g. morgan@example.com.", expected: "a simulated new account resumes the same draft straight into review", component: "BookingFlow (signin stage)" },
              { action: "Open Scenarios, switch Discovery to Earliest available, Apply.", expected: "the same DiscoveryStep renders a flat cross-provider time list instead of provider cards", component: "EarliestAvailableList" },
            ]}
            sayThisAloud="Only the composition changed — which stage renders and which discovery component mounts. The reducer, repository, review screen, and confirmation are the same code for every preset."
            followUp="What would change if approval-before-confirmation were required instead of instant booking?"
            tradeoff="That's a different state machine (submitted → pending → confirmed/declined), discussed as an extension in Topic 6 rather than implemented, to keep this slice's lifecycle simple."
          />
        </div>
      ),
    },
  ],
};
