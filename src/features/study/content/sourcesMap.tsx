import type { StudyTopic } from "./types";

const SOURCES: Array<{ name: string; url: string; note: string }> = [
  { name: "Zocdoc", url: "https://www.zocdoc.com/", note: "Discovery before identity." },
  { name: "MyChart feature overview", url: "https://www.mychart.org/l/en-us/explore/", note: "Patient status vs. account status." },
  { name: "NHS booking help", url: "https://www.nhs.uk/nhs-app/help/appointments/book-gp-appointment/", note: "Recoverable stale-slot flow." },
  { name: "NHS appointment configuration", url: "https://digital.nhs.uk/services/nhs-app/nhs-app-features/appointments", note: "Practice-controlled bookable slots." },
  { name: "Calendly time zones", url: "https://calendly.com/help/time-zones-overview", note: "Explicit displayed zone per invitee." },
  { name: "Calendly scheduling FAQ", url: "https://calendly.com/help/scheduling-faq", note: "Actionable confirmation and management." },
  { name: "Acuity Help Center", url: "https://help.acuityscheduling.com/hc/en-us", note: "Staff-adds-client vs. self-scheduling." },
  { name: "GOV.UK check answers", url: "https://design-system.service.gov.uk/patterns/check-answers/", note: "Per-row contextual edit actions." },
  { name: "React state-structure guidance", url: "https://react.dev/learn/choosing-the-state-structure", note: "Followed in Topic 4's state-ownership table." },
  { name: "Tailwind theme variables", url: "https://tailwindcss.com/docs/theme", note: "How tailwind.config.ts consumes tokens.css." },
  { name: "shadcn semantic theming", url: "https://ui.shadcn.com/docs/theming", note: "Reference for the semantic-role token pattern." },
  { name: "DTCG token format", url: "https://www.designtokens.org/TR/2025.10/format/", note: "Community spec, not a W3C Recommendation — discussed, not implemented." },
  { name: "Radix composition guidance", url: "https://www.radix-ui.com/primitives/docs/guides/composition", note: "General composition principles referenced for the FASTElement layer." },
  { name: "Storybook interaction testing", url: "https://storybook.js.org/docs/writing-tests/interaction-testing", note: "Distinct from accessibility testing, below." },
  { name: "Storybook accessibility testing", url: "https://storybook.js.org/docs/writing-tests/accessibility-testing", note: "addon-a11y, still needs manual review." },
  { name: "W3C contrast guidance", url: "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html", note: "4.5:1 normal text, 3:1 large text." },
  { name: "WCAG 2.2 target size", url: "https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html", note: "24×24 CSS px AA minimum, not 44px." },
  { name: "Focus-not-obscured guidance", url: "https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html", note: "Relevant to the sticky review footer." },
  { name: "W3C reflow guidance", url: "https://www.w3.org/WAI/WCAG22/Understanding/reflow.html", note: "320px-equivalent layout, no horizontal scroll." },
  { name: "React Aria quality guidance", url: "https://react-aria.adobe.com/quality", note: "Foundation vs. assembled-flow accessibility responsibility." },
];

const FILE_MAP: Array<{ area: string; path: string }> = [
  { area: "Domain types", path: "src/domain/models.ts, repository.ts, scenario.ts, errors.ts, eligibility.ts" },
  { area: "Fixtures", path: "src/data/fixtures/{locations,providers,patients,appointmentTypes,slots}.ts" },
  { area: "Mock repository", path: "src/data/mockRepository.ts, src/data/repository.ts" },
  { area: "Design-system elements", path: "src/design-system/elements/{button,field,select,option,radio,radio-group,dialog,disclosure,status-message}/" },
  { area: "Design-system React wrappers", path: "src/design-system/react/{createComponent,Button,Field,Select,RadioGroup,Dialog,Disclosure,StatusMessage}.tsx" },
  { area: "Booking flow", path: "src/features/booking/BookingFlow.tsx, components/*, hooks/*, state/*" },
  { area: "Appointments", path: "src/features/appointments/AppointmentsPage.tsx, components/*, hooks/*" },
  { area: "Scenarios", path: "src/features/scenarios/ScenariosDrawer.tsx, presets.ts" },
  { area: "App state", path: "src/state/{scenarioStore,sessionStore,preparationStore}.ts" },
  { area: "Study (this section)", path: "src/features/study/content/*, components/*" },
];

export const sourcesTopic: StudyTopic = {
  id: "sources",
  number: 8,
  title: "Sources and implementation map",
  sections: [
    {
      id: "sources-list",
      title: "Cited sources",
      sayThisAloud:
        "Every documented-pattern claim in Topic 2 traces to one of these sources, reviewed September 7, 2026 — I did not test any private booking flow or verify commercial outcomes.",
      keywords: ["citations", "links", "references"],
      body: (
        <ul className="list-disc pl-6">
          {SOURCES.map((s) => (
            <li key={s.url}>
              <a href={s.url} className="underline" target="_blank" rel="noreferrer">
                {s.name}
              </a>{" "}
              — <span className="text-text-muted">{s.note}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: "file-map",
      title: "Implementation map",
      sayThisAloud:
        "Every claim elsewhere in Study points at a real file in this exact repository — here's the top-level map.",
      body: (
        <table className="w-full border-collapse text-sm">
          <tbody>
            {FILE_MAP.map((row) => (
              <tr key={row.area} className="border-b border-border align-top">
                <td className="p-2 font-medium text-text-primary">{row.area}</td>
                <td className="p-2 font-mono text-xs text-text-muted">{row.path}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ),
    },
    {
      id: "simplifications",
      title: "Chosen simplifications",
      sayThisAloud:
        "Six providers, two locations, three patients, two visit types, and four scenario presets — deliberately small so the happy path is demonstrable in a few minutes and every screen stays explainable.",
      body: (
        <ul className="list-disc pl-6">
          <li>No real authentication — sign-in checks email only, explicitly labeled as a simulation.</li>
          <li>No payments, insurance verification, or EHR integration.</li>
          <li>No AI chatbot, provider calendar editor, or recurring appointments.</li>
          <li>No family/proxy management or drag-and-drop scheduling.</li>
          <li>Persistence is namespaced localStorage, not a real database.</li>
        </ul>
      ),
    },
    {
      id: "verified-commands",
      title: "Verified commands",
      sayThisAloud:
        "typecheck, lint, unit tests, and the production build all pass as of the last commit; Playwright/Storybook coverage for the domain components is a Phase 7 item, tracked honestly rather than claimed done.",
      body: (
        <pre className="overflow-x-auto rounded-md bg-surface-sunken p-3 text-xs">
          {`yarn typecheck        # tsc -b --noEmit
yarn lint             # eslint .
yarn test             # vitest run
yarn build            # tsc -b && vite build
yarn dev              # local dev server
yarn storybook        # Storybook 8 dev server
yarn build-storybook  # static Storybook build`}
        </pre>
      ),
    },
  ],
};
