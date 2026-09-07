Build a focused booking demo and UX engineering study guide

Implement the complete application described below in this repository. Make reasonable implementation decisions, install compatible dependencies, write the code and substantive study content, run the available checks, and fix problems. Deliver a working application, not just a plan, wireframes, static screens, or documentation. The booking demo and the built-in study guide are both required.

1. Purpose and interview context

I am Brian Brady, preparing for a Clover Health / Counterpart Health UX Engineer interview. The earlier interview context describes a frontend-focused system-design conversation with engineers. A patient-booking exercise is my preparation hypothesis, not a confirmed employer assignment. Do not present the demo as Counterpart's actual product, an official assignment, or a reconstruction of its internal architecture.

The role belongs to Engineering and emphasizes design-system ownership, reusable components and interaction patterns, coded prototypes, frontend decisions, collaboration during discovery, and experience quality. React, TypeScript, Tailwind, and Storybook are named in the official UX Engineer posting, reviewed September 7, 2026.

Build something I can inspect, explain, and adapt while practicing a collaborative interview. The central exercise is translating uncertain requirements into a coherent user flow and maintainable frontend. Product reasoning matters, but do not turn this into an extensive visual-design assignment or a backend infrastructure project.

My relevant background includes Microsoft Fabric components built with browser-native Web Components and React/Angular wrappers, accessibility, component APIs, Storybook, and AI-assisted engineering. Use that context in a short study section connecting my experience to this React-oriented role. Do not fabricate personal stories, accomplishments, or measurements.

2. Keep the product deliberately small

Use the neutral fictional name Care Booking. One practice, two locations, six fictional providers, three seeded patients, and two appointment types are enough. Use routine visits, with a 30-minute new-patient appointment and a 15-minute established-patient follow-up. Include in-person and virtual slots where supported. The product's happy path should be demonstrable in a few minutes. The detailed study requirements below are learning content, not a reason to expand the product feature set.

Implement only these product capabilities:

Browse/filter providers and available times.

Book as a new patient, returning patient, or staff member acting for a patient.

Review and confirm a booking.

View, reschedule, and cancel appointments.

Demonstrate a few deterministic loading, empty, conflict, and error states.

Provide three top-level destinations: Book care, Appointments, and Study. Booking stages can use nested routes or controlled internal navigation. The staff scenario changes the content of these destinations; it does not introduce a separate admin application. Put the component gallery inside Study.

Use mocked asynchronous data access and synthetic records. No real authentication, backend deployment, medical advice, EHR integration, payments, insurance verification, SMS/email delivery, AI chatbot, provider calendar editor, medical records portal, recurring appointments, family proxy management, or drag-and-drop scheduling. Discuss relevant extensions in Study without implementing them. Do not add decorative analytics dashboards or a large settings area.

Product screens should have concise, useful copy. Put verbose explanations and implementation terminology in Study and the preparation controls. A small persistent Demo · fictional data label is sufficient context for the product.

3. Research basis to include in Study

These are documented patterns from established products, not claims that one flow has the best measured conversion rate. Research reviewed September 7, 2026. Actual healthcare configurations vary by organization. Preserve these distinctions and the links in the app's Sources section.

Source

Documented behavior

Decision for this demo

Zocdoc

Its public discovery experience emphasizes provider specialty, location, insurance, and availability.

Let users explore providers before committing to an identity flow. Show a few decision-relevant details and real fixture availability. Do not copy reviews, rankings, or a full marketplace.

MyChart feature overview

Open Scheduling and provider discovery can be available without a MyChart account; appointment management also supports ongoing care.

Treat patient status and account status as separate concepts. Support guest booking and a short returning-patient path.

NHS booking help

A selected time can become unavailable before booking finishes; users can look again for alternatives.

Make stale availability a first-class, recoverable scenario. Preserve entered details while choosing another time.

NHS appointment configuration

Practices control the appointment types and slots offered for online booking.

Model eligible bookable slots, rather than assuming every gap on a provider's calendar is available to every patient. This is a pattern reference, not a US policy requirement.

Calendly time zones

Invitees can see availability in their local time and choose another time zone.

Make the displayed zone explicit and format actual instants consistently. Keep clinic location time prominent for in-person visits.

Calendly scheduling FAQ

Bookings can be changed or canceled through management and confirmation pathways.

Make confirmation actionable, and give the demo a small appointment-management view.

Acuity Help Center

Acuity distinguishes clients scheduling themselves from staff adding clients to appointments and managing a schedule.

Staff should identify the patient first, retain that context, and reuse the booking domain and UI patterns.

GOV.UK check answers

Review screens provide contextual change actions and preserve previously supplied answers.

Show a concise booking summary with specific edit actions and a clear final confirmation action.

These recommendations are design judgments drawn from the documented patterns. Do not say I tested private booking flows, completed live bookings, or verified commercial outcomes.

4. Stack and code organization

Inspect the existing repository and its instructions first. Preserve useful existing setup and unrelated user changes. If it is empty, use React, TypeScript with strict checking, Vite, Tailwind CSS, and Storybook. Use current mutually compatible stable versions and the project's package manager; retain the lockfile. Check installed-version documentation when APIs differ.

Use a small set of Radix-backed shadcn/ui components if no design system exists. Use that family consistently for the few complex primitives needed. Prefer native HTML inputs, selects, radio groups, and buttons when they solve the interaction. Do not install multiple competing primitive libraries or build a custom combobox/calendar just to display six providers and a week of times.

React hooks, a typed reducer, and a repository interface are sufficient. Do not add Redux, a generic workflow engine, or a state-machine dependency. Use an existing router if available; otherwise use a small standard router. There is no need for SSR or a full-stack framework for this local rehearsal demo. Keep state responsibilities separate even if no query library is installed.

Suggested organization, adaptable to existing conventions:

src/app/: routes, shell, providers.

src/design-system/: tokens, shared UI components, stories.

src/features/booking/: flow reducer, forms, provider results, slot picker, review, confirmation.

src/features/appointments/: listing, reschedule, cancel.

src/features/scenarios/: typed presets and preparation drawer.

src/features/study/: navigation, authored content, diagrams, walkthroughs, component gallery.

src/domain/: models, eligibility rules, repository contract.

src/data/: fixtures, mock repository, demo persistence.

src/lib/: small date-formatting and shared utilities.

Keep the code easy to explain. Abstract when behavior or semantics are shared; do not create a component for every wrapper element.

5. Switchable interview scenarios

Provide one compact Scenarios drawer, visibly belonging to the preparation shell. It must be possible to hide preparation navigation for a clean product walkthrough and restore it through a small, clearly named control.

Start with these four named presets:

Preset

Primary actor

Patient context

Authentication policy

Discovery entry

New patient

Patient

New to practice

Guest allowed

Provider first

Returning patient

Patient

Established fixture patient

Demo signed in

Provider first, usual provider suggested

Staff booking

Staff

Pick an existing patient or enter a new one

Demo staff session

Earliest available

Sign-in required

Patient

New to practice

Demo sign-in required before submission

Provider first

The returning-patient preset must begin in a simulated signed-in state. The sign-in-required preset must begin signed out so its late authentication gate is actually demonstrable. An existing patient can also use guest booking when policy allows: being known to a practice does not imply having a portal account.

Expose only these small overrides:

Discovery: Choose a provider / Earliest available.

Patient booking access: Allow guest booking / Require demo sign-in to book. Hide this irrelevant control in staff mode.

Data scenario: Normal, No matching availability, Slot taken on submit, Network failure once, Slow response.

Implement presets as typed configuration consumed at the flow-composition layer. Scenario names must not be scattered through component conditionals. Use a discriminated union or similarly constrained shape to prevent invalid combinations of actor, identity, and patient context.

Changing preset or structural overrides requires an explicit Apply scenario action. If a booking draft exists, explain that applying it will start a fresh draft; allow keeping the current draft by dismissing the drawer. This is a local discard confirmation. Applying a new scenario clears incompatible identity and draft data, aborts or invalidates outstanding reads, and does not delete already committed appointments. Clear cached private views when changing actor. Disable structural switching during a mutation so a pending result cannot appear under another identity.

Provide a separate Reset demo data action with a clear local reset confirmation. Data faults should be reproducible, scoped to their named operation, and documented. A slot conflict is consumed by the next booking/reschedule commit; a one-time network failure happens before that mutation commits and a retry can succeed. Slow mode uses a deterministic delay. No random failures.

In the drawer, show a short requirement-to-behavior explanation, such as: “Staff booking asks for the patient first and keeps their identity visible.” Make the same mapping available in Study with more detail.

6. Working user flows

A. Patient discovery and booking

The default product view starts with useful providers and real fixture availability. Browsing never requires an account, including under the sign-in-required scenario. Do not make people fill out a registration form to see whether care is available.

Use at most five useful filters: appointment type, location, visit mode, date, and optional provider-name search. Show active filters and a clear reset action. Place optional controls behind a simple disclosure on small screens. Do not implement insurance filtering in this demo; discuss it as a requirement to clarify. Never invent coverage certainty.

Patient type determines eligibility for the two visit types. Established/new means relationship to this practice. Use a lightweight question or preset context, not a large intake step. Available results must reflect the actual selected type, mode, location, patient eligibility, and date.

In provider-first mode, show a provider list with name, clinical role/specialty, locations, supported modes, whether they accept new patients, and next eligible available time. Choosing a provider opens their times in the same flow. Inline provider details are enough; a profile destination is unnecessary.

In earliest-available mode, show a chronological list of eligible slots across providers. Every result names the provider, location/mode, date, and time zone. Selecting it fills both provider and slot. Avoid returning users to a redundant provider-selection step.

Use a date-grouped list of times and a small day selector. Native radio inputs styled as choices work well for single-slot selection. Expose loading, no results, unavailable, selected, and error states. Slot selection is not a reservation and must not be presented as a guaranteed hold.

After a time is selected, collect only the minimum synthetic booking details: name, date of birth for practice identification, and one contact method. Use accessible date entry and sensible validation without enforcing narrow name formats. Label optional fields. No medical-history form or unrestricted symptom questionnaire.

For guest-allowed policy, show Continue as guest and an optional Use demo account action. Use clearly labeled fixture data or an obvious Fill demo details helper. An existing patient using guest access must not expose or automatically load private records based solely on name and date of birth; treat their supplied data as an unverified booking identity in this prototype.

For required-sign-in policy, gate the final submission, not public discovery. Use a clearly labeled simulated account action that resumes the draft. Do not collect passwords or implement a deceptive real login. A newly simulated account may still represent a patient who is new to the practice.

Review shows patient, provider, type/duration, mode/location, full date/time, and displayed time zone. Include specific edit actions. Editing upstream choices invalidates any incompatible selected slot but keeps relevant patient details. Resuming after sign-in returns to the draft with a clearly resolved identity and revalidated availability.

The final action is Confirm booking. While submitting, block duplicate activation and explain progress. Show success only after the repository returns a committed appointment. Confirmation includes a reference, appointment details, and working actions to view or manage it. Do not claim a message was sent. A demo notification preview is unnecessary.

B. Returning patient

Use one seeded, simulated signed-in patient. Appointment management initially shows that patient's upcoming appointment. Reuse known details instead of asking them to retype everything. Suggest the usual provider without making that provider mandatory.

Booking still uses the same provider results, slot picker, review, and repository as other paths. Avoid adding medications, clinical history, invoices, or a full patient dashboard.

C. Staff-assisted booking

Start with a small patient lookup using name or fictional reference. A staff member can pick a seeded patient or enter minimum details for a new patient. Display a persistent Booking for [name] context with date of birth or reference so similarly named records are distinguishable.

Then show the shared filters and earliest eligible times. Staff can switch to choosing a particular provider. Prefill known details and use the same final review and commit contract. Staff still obey provider availability and patient eligibility. Do not introduce overbooking or bypass rules.

The staff Appointments view shows practice appointments with simple date/provider/patient filters. Use an ordinary list or accessible table, with a readable mobile arrangement. No calendar grid is required. Actor and appointment subject must be distinct fields in the domain model.

D. Reschedule and cancel

All actors can manage only the records allowed by the simulated access context. Signed-in patients see their records, staff see the practice's records, and guests see only bookings associated with their current demo session. Explain in Study that a real guest management pathway would require an appropriately protected link or verification.

Reschedule reuses slot selection and review. Show the current appointment and proposed replacement together. Preserve the appointment's patient and visit type; choose another eligible time with the same or another provider who supports that type. Only swap the booking after the replacement succeeds. A conflict or failure must leave the original appointment intact. Dismissing the reschedule draft also leaves it intact.

Cancellation uses an accessible confirmation dialog showing the appointment being canceled. A successful mutation updates its status and makes the slot available again. A failed mutation leaves it booked and offers retry. Canceled appointments must not remain actionable as upcoming bookings.

Do not treat filtering a client-side list as real authorization. Demonstrate the access boundary in the mock service, and describe its production replacement in Study.

7. Domain, state, and asynchronous behavior

Use explicit TypeScript types for:

Provider: id, name, specialty/role, supported locations and modes, patient eligibility.

Location: id, name, address summary, IANA time zone.

AppointmentType: id, label, duration, allowed patient context.

Slot: id, provider, location or virtual context, type eligibility, start/end instants, version.

Patient: fixture identity and basic contact details; no medical history.

ActorContext: public guest, simulated patient account, or simulated staff session, including practice scope.

BookingDraft: current stage, subject identity/details, filters, provider/slot ids, optional appointment being rescheduled.

Appointment: id, reference, patient/guest subject, actor who booked, provider, type, mode/location, start/end instants, booked/canceled status, version.

ScenarioConfig: explicit flow configuration and deterministic fault mode.

Separate four kinds of state:

Kind

Examples

Ownership

Search/navigation

Provider id, selected day, nonsensitive filters

Route/query or feature state; use one authoritative representation

Server-like data

Providers, slots, committed appointments

Mock repository plus a small asynchronous resource hook

Draft/UI state

Form input, selected slot, stage, dialog

Feature reducer and local component state

Preparation state

Preset and injected fault

Scenario provider outside the product domain

Patient details, names, DOBs, and contacts do not belong in URLs. Store ids rather than copying provider/slot objects into every component. Derive summaries and valid transitions from canonical state. Use explicit loading/error states rather than overlapping booleans that permit contradictory combinations. This follows the general direction in React's state-structure guidance.

Expose a small asynchronous repository contract, for example:

interface BookingRepository {
  searchProviders(query: ProviderQuery, signal?: AbortSignal): Promise<Provider[]>;
  getSlots(query: SlotQuery, signal?: AbortSignal): Promise<Slot[]>;
  searchPatients(query: string, actor: StaffActor): Promise<Patient[]>;
  listAppointments(actor: ActorContext): Promise<Appointment[]>;
  book(input: BookingInput, actor: ActorContext, key: string): Promise<Appointment>;
  reschedule(input: RescheduleInput, actor: ActorContext, key: string): Promise<Appointment>;
  cancel(input: CancelInput, actor: ActorContext, key: string): Promise<Appointment>;
}

The method names are illustrative; adapt the actual types coherently. Do not leave undefined types or pseudo-code in the implementation.

Use typed, recoverable failures such as validation, slot conflict, stale appointment, access denied, and network failure. In Study, map the read/commit methods to an illustrative HTTP contract with request/response examples and appropriate status codes (for example, 409 for a booking conflict). Identify this as a proposed integration boundary, not Counterpart's API. Do not implement an HTTP server just for this explanation.

Behavior requirements:

Keep asynchronous latency in the data adapter. Use query identity and cancellation or a response-generation guard so an old response cannot replace results for a new filter or scenario.

At commit, recheck slot existence, time, version, type, mode/location, patient eligibility, and applicable access context. Slot availability checks and appointment writes happen together within the mock service operation after its simulated delay.

Reject overlaps for a provider across all locations, modes, and appointment types. Different slot ids must not allow overlapping confirmed visits. Check intervals, not only slot-id equality. Explain in Study that real enforcement needs a server/database transaction and appropriate constraints; client-side persistence cannot provide a multiuser guarantee.

Reuse an idempotency key for retries of the same unchanged mutation. Associate it with a normalized request fingerprint and actor; reject reusing it with a different payload. A changed slot or new operation gets a new key. Replay a successful result without creating another appointment or patient. Do not permanently cache a retryable pre-commit failure as success/final completion.

For reschedule, use the appointment version, validate and acquire the replacement before releasing the original, and commit the change as one mock operation. Reject a stale appointment update with a recoverable message.

Never optimistically claim a booking is confirmed. Disable repeated submission for feedback; explain why idempotency and atomic conflict handling address different failure modes.

On conflict, invalidate the unavailable selection, refresh eligible alternatives, preserve patient details and filters, and announce what happened. On generic pre-commit failure, keep the review ready for a retry.

Persistence may use a namespaced, versioned localStorage adapter containing only synthetic demo data. Persist committed appointments and successful idempotency results consistently so refreshing does not create duplicates. Keep drafts in memory. Initialize fixture dates relative to an injectable clock and offer an obvious reset when fixtures age out. Recover clearly from unavailable/corrupt storage rather than crashing.

Scope persistence to a local rehearsal demo. Do not claim browser storage is secure patient storage, cross-tab synchronization, or a real backend.

Use UTC ISO instants for slots and appointments and IANA zones for display. Keep a calendar date distinct from a timestamp. Format through a single date helper using Intl.DateTimeFormat and a proven time-zone utility if conversion is needed. Do not hard-code a fixed UTC offset or call Pacific Time “PST” all year. Format and group each result in the selected display zone; changing that zone must not change the selected instant. For in-person visits, default to the clinic zone; for virtual visits, default to the viewer zone and expose a small zone selector. Mention DST and cross-midnight grouping in Study.

8. Design system as the foundation

Tokens and styling

Use one authoritative token definition in CSS custom properties, with Tailwind consuming that definition. Do not keep independently edited copies in JSON, component files, and CSS. Include:

A small base palette and spacing/type scales.

Semantic roles for page and raised surfaces, primary/muted text, borders, action colors, focus, success, warning, and error.

Radius, elevation, content-width, motion-duration, and control-size tokens.

Semantic background/foreground pairings so an action or status color is paired with readable text.

Feature components should consume semantic roles instead of raw palette values. Use Tailwind for layout and token-based styling, following the installed version's conventions. Current documentation describes Tailwind theme variables and shadcn semantic CSS-variable theming.

Explain in Study that the DTCG token format supports exchange between tools. A production team could generate CSS and other outputs from one token source. This demo does not need a token compiler. Do not describe the community specification as a W3C Recommendation or add infrastructure solely to demonstrate its existence.

Components and patterns

Use three understandable layers:

Accessible behavior: native HTML and the chosen primitive library.

Shared styled components: Button, Field, Select, RadioGroup, Dialog, status message, disclosure, and a few layout primitives where useful.

Domain patterns: ProviderResult, SlotPicker, BookingSummary, PatientContext, AppointmentItem.

Screens compose those pieces. Domain patterns must not leak healthcare assumptions into generic Button/Field components. Shared components should forward applicable native props, event handlers, and refs without breaking semantics. Complex primitive composition still requires care, as explained in Radix's composition guidance.

Prefer a small explicit variant API, such as intent, size, and pending, over combinations of unrelated booleans. Show examples in the study gallery and Storybook. Do not invent a universal configuration-driven form renderer.

The controlled SlotPicker receives eligible slot data, selected id, display zone, load/error status, and a selection callback. It must not fetch patients, inspect scenario labels, or submit bookings. Explain that boundary and show its actual typed interface. Booking policy belongs in feature/domain code, not in presentation primitives.

Visual direction and responsiveness

Create a calm, professional interface: neutral surfaces, restrained teal or blue accent, clear type hierarchy, legible body text, visible borders, generous but purposeful spacing, and consistent controls. Use a system font stack. Avoid hero sections, gradients, excessive rounded cards, tiny muted text, stock photography, and motion that distracts from a form.

Use a single column on narrow screens and an optional secondary booking-summary column when space permits. Keep DOM reading and focus order meaningful when layout changes. Use intrinsic Grid/Flex layouts, wrapping, minmax, logical properties, and content-driven breakpoints. Show the same information in a readable mobile layout; do not merely shrink desktop UI.

Build one accessible default visual theme. In the Study gallery, include a small working demonstration that changes a semantic accent token within the preview and a comfortable/compact density comparison using the same components. Keep these experiments out of the patient flow. Do not build a full theme editor or duplicate component implementations.

Accessibility and quality

Target WCAG 2.2 AA practices for the implemented flows without claiming an automated audit certifies conformance.

Use actual labels, instructions, associated errors, and meaningful autocomplete/input attributes. Use fieldsets/legends for grouped choices.

Provide full keyboard operation, clear focus indicators, appropriate focus movement on step changes/errors, and focus return when dialogs close.

Use a persistent inline explanation for important failures; toasts alone are insufficient. Announce result changes and mutation status appropriately without reading every update excessively.

Ensure text contrast meets applicable requirements. Normal text generally needs 4.5:1; large text has a 3:1 threshold. See W3C contrast guidance.

Choose approximately 44px controls for primary patient interactions as a usability target. Explain that WCAG 2.2 AA target size is 24 by 24 CSS pixels with specified exceptions; do not equate 44px with the AA minimum.

Keep focused controls visible, especially around sticky summaries and footers. See focus-not-obscured guidance.

Check reflow at narrow widths, 200% text zoom, and a 320 CSS-pixel layout equivalent. Avoid page-wide horizontal scrolling. See W3C reflow guidance.

Respect reduced motion. Use text/icons in addition to color for selection and status. Keep an unavailable slot's explanation discoverable.

Using an accessible primitive is a foundation, not proof the assembled flow is accessible. React Aria's quality guidance is a useful discussion reference for keyboard, focus, semantics, and the responsibilities that remain with the application. Do not add React Aria as a second dependency just because this reference is included.

Storybook

Configure a real runnable Storybook using the same tokens and exported components as the app. The in-app component gallery complements it and must not replace it.

Create focused stories for Button, Field, Dialog, ProviderResult, SlotPicker, and BookingSummary. Cover applicable default, pending, disabled, selected, invalid, empty, conflict/error, long-content, and narrow-layout states. Do not produce every irrelevant Cartesian combination.

Add meaningful interaction coverage for keyboard slot selection, form validation, and dialog focus behavior. Configure the accessibility addon for supported applicable rules, including WCAG 2.2 checks where the installed axe version supports them. Check defaults rather than assuming all desired rules are enabled. Explain the distinction between Storybook interaction tests and accessibility tests, and what still needs manual evaluation.

Document shared APIs, composition, intended use, misuse, accessibility responsibilities, and how changes are reviewed. Include a concise contribution lifecycle: observed need, existing-pattern review, agreed API/behavior, implementation and examples, validation, adoption, then versioning/deprecation when contracts change. No monorepo publishing pipeline is required.

9. Built-in Study section: substantial authored content

Study must be populated when the app first runs. Do not deliver empty categories, placeholder cards, a list of external links, or prompts asking me to write the material myself. Write readable explanations grounded in the implementation.

Use a left-side table of contents on larger screens and a simple mobile equivalent. Put a short “Say this aloud” answer first, followed by expandable deeper reasoning and actual code/component references. A small text search over study titles, questions, and content is useful; no search service is needed.

Aim for roughly 3,500–5,000 words across the whole study guide, organized for quick scanning and deeper reading. Reuse content definitions instead of copying prose across screens. Keep sections independently navigable. Include these eight topics:

Start the conversation: opening questions, assumed scope, success criteria, and an adaptable session agenda.

Flow decisions: personas, scenario mapping, documented product patterns, and why a requirement changes a particular part of the application.

Walk through the app: annotated rehearsals with real controls, state changes, and recovery paths.

Frontend architecture: state ownership, domain model, component boundaries, service contract, and diagrams.

Design system: token layers, APIs, composition, responsive behavior, Storybook, accessibility, and governance.

Reliability and trade-offs: stale results, double booking, retries, time zones, persistence, access boundaries, and production extensions.

Interview practice: substantive questions and revealable model answers, including requirement changes.

Sources and implementation map: the supplied citations, actual file/component names, chosen simplifications, and verified commands.

Opening questions and the choices they affect

Include this table and expand on how to ask a few questions, make assumptions explicit, and proceed. Do not encourage spending the entire interview interrogating the interviewers.

Ask

Why it changes the solution

“Who is doing the booking: the patient, practice staff, or both?”

Entry point, identity selection, information density, and permission boundary.

“Are we helping new patients find care, or existing patients arrange a follow-up?”

Discovery versus continuity, eligibility, and how much detail can be prefilled.

“Can people browse and book as guests? Where is authentication actually required?”

Public discovery, late gating, draft preservation, and appointment management access.

“Do people usually care about a particular provider, or the earliest suitable time?”

Provider-first versus time-first results; the selected appointment model stays shared.

“Are these confirmed bookings or requests the practice must approve?”

Final state and lifecycle. The implemented scope uses direct confirmation; approval requests are a separate extension.

“Are available slots supplied by an existing scheduling system?”

Whether we consume bookable inventory or must design availability generation and integration.

“What makes a slot eligible: visit type, duration, new-patient status, location, or visit mode?”

Search contract and validation rules.

“Should rescheduling and cancellation be included in the first slice?”

Appointment lifecycle, reusable selection UI, and mutation semantics.

“What happens when a displayed slot is no longer available?”

Server authority, conflict recovery, and preserving user effort.

“Which components and patterns already exist, and what devices or accessibility needs matter most?”

Reuse strategy, layout, interaction behavior, and what warrants a new shared component.

“What would make this successful: completed bookings, fewer calls, or faster staff scheduling?”

Evaluation and trade-offs; do not invent targets without a baseline.

Include a natural opening statement: “Before choosing the screens, I’d like to clarify who is booking and whether they already know the provider. I’ll assume the scheduling system supplies eligible slots, then focus on discovery, confirmation, and recovery when availability changes. Does that match the scope you want?”

Provide a suggested 60-minute rehearsal agenda: 5 minutes scope, 10 happy path/data, 15 components and state, 15 failures and changing requirements, 10 accessibility/design-system/testing, 5 recap. Label this as a practice agenda, not a confirmed interview duration. Explain how to shorten it or use additional time for one deeper topic.

Annotated walkthroughs

Author five walkthroughs. Each has a goal, a Load scenario button, exact actions using the real UI labels, expected state, the component/service involved, what I could say aloud, one likely follow-up question, and an explanation of the trade-off. Do not build a fragile overlay tour framework. A readable walkthrough with a scenario-launch link is enough.

New patient books without an account: discover, choose a time, guest details, review, confirm, find the booking in session-scoped management. Explain why identification comes after discovery and why guest access is not verified portal identity.

Returning patient changes an appointment: inspect existing booking, select replacement, compare, commit. Explain retaining the original booking until success.

Staff books for another person: select an existing patient, confirm identity, earliest eligible time, review, confirm. Explain actor versus subject and shared components.

A time disappears during confirmation: inject slot conflict, submit, show recovery, select an alternative without re-entering details. Explain selected versus committed state.

The interviewer changes the requirement: apply the sign-in-required preset, browse publicly, hit the simulated late gate, resume; then demonstrate earliest-available discovery. Explain what changed in composition and what remained reusable.

Scenario launches should load coherent starting fixtures/configuration. If a walkthrough resets appointments, clearly say so and use the existing local reset confirmation. Never silently delete a user's current rehearsal work.

Required diagrams

Render five compact diagrams in Study, using Mermaid locally or accessible SVG. Bundle rendering locally and use trusted authored content only. Lazy-load diagram code with Study. Include a nearby text explanation and readable mobile presentation; do not leave raw diagram source as the only output.

Use the following three as starting content, updating names to match the real implementation:

flowchart TD
  E["Booking entry"] --> A{"Actor?"}
  A -->|Patient| D["Discover provider or time"]
  A -->|Staff| P["Identify patient"]
  P --> D
  D --> I["Resolve booking identity"]
  I --> R["Review appointment"]
  R --> C{"Commit result?"}
  C -->|Booked| S["Confirmation"]
  C -->|Conflict| T["Choose another time"]
  T --> D

flowchart TD
  S["Scenario configuration"] --> F["Booking composition"]
  F --> P["Provider and slot patterns"]
  F --> Q["Draft reducer"]
  P --> U["Shared accessible UI"]
  U --> T["Semantic tokens"]
  F --> H["Async resource hooks"]
  H --> R["Repository contract"]
  R --> M["Mock data adapter"]

sequenceDiagram
  participant U as User
  participant UI as Booking UI
  participant R as Repository
  participant D as Canonical store
  U->>UI: Confirm selected time
  UI->>R: Book with idempotency key
  R->>D: Check prior result and slot eligibility
  alt Available
    R->>D: Commit appointment and result together
    R-->>UI: Confirmed appointment
    UI-->>U: Confirmation
  else Taken
    R-->>UI: Slot conflict
    UI->>R: Refresh eligible alternatives
    R-->>UI: Current slots
    UI-->>U: Keep details and choose another time
  end

Also author:

A booking state diagram showing discovery, details, review, submitting, confirmed, conflict, and retryable error, with valid recovery/back transitions. Explain how new versus existing identity changes required stages.

A small entity-relationship diagram for Provider, Slot, Appointment, and Patient. Explain that a slot can have historical canceled appointments while only valid non-overlapping bookings consume capacity; a guest identity may remain unresolved in a real system. Do not imply a frontend model establishes a database uniqueness guarantee.

Interview question bank and answer anchors

Include all 20 prompts below, each with a concise spoken answer and an expandable deeper explanation grounded in actual code. Use these anchors as the substance, then explain the implementation, alternative, and a likely follow-up. Avoid generic definitions disconnected from booking.

Where would you start with this ambiguous brief? Identify the actor, task, outcome, and boundaries. Agree on a minimal happy path and two meaningful failures. Explain one assumption and invite correction before choosing components.

How does staff booking differ from patient booking? Staff must choose and retain the patient's identity and may need faster repeat workflows. Reuse slot selection, review, and mutation contracts; change entry composition and access context.

Would you require an account? Separate browsing, booking identity, and later access to private appointments. Offer guest booking when policy allows; an account requirement belongs at a justified boundary and must preserve the draft. Practice membership and portal-account ownership are independent.

Provider first or time first? It depends on continuity versus speed. Both paths produce a provider and eligible slot, so they should converge into the same draft and confirmation flow. Validate the choice with users and task evidence.

What belongs in the shared design system? Generic behavior, tokens, controls, and broadly reusable interaction patterns. A SlotPicker may be a shared domain pattern; provider eligibility does not belong in a generic radio component. Explain ownership rather than treating every reused function as design-system code.

How would you design a component API? Start with user states and composition needs. Define clear controlled values, events, variants, labeling, and loading/error semantics. Show the real SlotPicker interface and explain the fetching and booking responsibilities it excludes.

Why aren't Tailwind or a component kit the entire design system? They help implement styling and behavior. A maintained system also needs semantic decisions, APIs, usage patterns, accessibility expectations, examples, ownership, contribution practices, and compatibility management.

How do tokens help here? Semantic roles let consumers express intent and let a system change centrally. Keep values authoritative in one place and show the accent/density previews using the same components. Distinguish reusable decisions from arbitrary CSS variables.

Where should state live? Shared data belongs behind the repository; draft state belongs with the booking flow; transient disclosure state belongs locally; non-sensitive search state can live in navigation. Avoid copied derived state and unrelated global state.

What if a slower old request finishes last? Key results by the full query and ignore or abort outdated responses. Reset/invalidate appropriately when scenario context changes. A debounce reduces requests but does not solve response ordering.

How do you prevent double booking? The server must enforce atomic availability checks and writes. This demo simulates that service boundary; disabling a button or trusting displayed availability does not enforce capacity across users. Explain interval overlaps when duration varies.

What does idempotency solve? A repeated unchanged operation can reuse its result rather than creating another appointment. It does not itself prevent two different people from booking the same slot. Explain stable retry keys, request fingerprints, and new keys when intent changes.

What if the booking succeeds but the response is lost? A production client must resolve the uncertain result using the original operation key or a status lookup, not immediately claim failure or submit new intent. Contrast this with the implemented pre-commit failure simulation. Do not claim the lost-response scenario is implemented unless it actually is.

Would you optimistically update this flow? Selection and local UI feedback can be immediate; booking confirmation should wait for the authoritative result. The consequence of misleading confirmation justifies that boundary. Explain pending feedback and recovery.

How do you reschedule safely? Validate the new slot and appointment version, then perform the swap atomically. Keep the original on failure. Do not implement rescheduling by canceling first and hoping the replacement succeeds.

How would you make date and slot selection accessible? Use a simple labeled date/slot choice before building a custom calendar. Explain keyboard selection, programmatic labels including the zone, focus on stage transitions, announcements, and errors that preserve input.

How do you handle responsiveness and density? Compose layouts according to available space and preserve DOM order. Reduce unnecessary detail before shrinking controls. Staff density can change spacing, but it cannot erase labels or make actions hard to operate.

How do you validate a shared component? Combine typed contracts, representative stories, focused interaction checks, automated accessibility checks, and manual keyboard/zoom inspection. Test meaningful behavior, not a snapshot of every DOM wrapper. Changes also need adoption and regression consideration.

How does your Web Components experience translate to this role? Shared semantics, stable APIs, wrapper parity, accessibility, and documentation apply across frameworks. Use React naturally for this assignment; propose Web Components only when actual multi-framework requirements justify the added integration surface. Do not force past architecture onto a new context.

How would you collaborate and use AI responsibly in this work? Make assumptions visible, prototype uncertain interactions, review component reuse with design/engineering, and validate generated code against the repository and real behavior. AI can accelerate implementation and examples; API contracts, accessibility, correctness, and review remain engineering responsibilities.

Add four brief requirement-change drills using these existing topics: guest access removed, earliest appointment prioritized, a request/approval model introduced, and availability supplied by an external EHR. For each explain the UX consequence, affected state/contract, reused components, and what remains outside the prototype.

Production extensions and evaluation

Use one concise table of “implemented here / would change in production / why.” Cover real authentication and per-record authorization, protected guest links, transactional persistence, authoritative scheduling integration, idempotent notification delivery, monitoring, and handling sensitive data. Do not produce a compliance certification checklist or invent Counterpart's infrastructure.

Discuss appointment requests as a different state machine: submitted request, pending review, then confirmed or declined. A request receipt is not a confirmed appointment. Leave this in Study rather than adding an approval console to the demo.

Explain useful measures without fake numbers: eligible-search-to-confirmation completion, stage abandonment, time to find a suitable slot, staff task completion time, conflict frequency and recovery, duplicate bookings, and accessibility task success. State denominators/context and privacy considerations if showing example event shapes. No analytics backend or telemetry dashboard is needed.

10. Validation and completion criteria

Implement in this order: foundation and fixtures; default end-to-end booking; returning/staff composition; reschedule/cancel and recoverable faults; Storybook and populated Study; verification. Continue through every phase. Do not stop after a polished shell.

Use a small, meaningful verification set rather than a large test suite. Critical behaviors to cover:

New patient browses publicly and confirms a guest booking; management shows only that guest session's booking.

Required demo sign-in appears after discovery and resumes the selected draft without bypassing final validation.

Returning-patient context prefills the appropriate details; staff booking records the correct actor and subject.

Old async results cannot replace the newest search/scenario results.

A conflicting booking preserves details and offers current alternatives.

Repeated successful submission with the same key returns one appointment; a retry after the injected pre-commit failure can succeed.

Failed rescheduling retains the original; successful rescheduling moves occupancy; cancellation releases occupancy.

Slot formatting/grouping respects selected zones, including a small deterministic DST/cross-midnight fixture test.

Cover service invariants with focused unit tests and the central user journey with an integration or browser test, using existing tooling where possible. Do not duplicate identical assertions across every test layer. Use Storybook checks for component interactions where they already provide suitable coverage.

Run TypeScript checking, the production build, focused tests, and the Storybook build. Check the main booking flow manually at a desktop and narrow viewport, with keyboard operation and zoom. Inspect real rendered screens if browser tools are available. Fix material failures. Report exactly which checks ran, passed, failed, or could not run; do not imply unperformed checks passed.

Before finishing, verify that:

All scenario presets lead to working flows and the overrides change actual behavior.

There are no inert primary buttons, fake booking confirmations, dead navigation, placeholder study chapters, or diagrams left only as source text.

Study walkthroughs match actual labels, state transitions, component names, and file paths.

Components and Storybook use the same tokens and implementations as the app.

Product screens remain concise and the default booking task is easy to understand.

The app starts without API keys or external accounts and supports repeatable demo reset.

Provide a short README with install/start/build/test/Storybook commands, scenario descriptions, architecture entry points, and the small set of intentional limitations. At completion, summarize what works, how to run it, and verification results. Do not describe speculative features as implemented.

The result should let me say: “Here is a small working flow. Here are the assumptions behind it, how the reusable components and state support it, what happens when the system disagrees with the UI, and how we can adjust it when the requirements change.”