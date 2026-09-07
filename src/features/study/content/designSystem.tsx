import { ComponentGallery } from "../components/ComponentGallery";
import type { StudyTopic } from "./types";

export const designSystemTopic: StudyTopic = {
  id: "design-system",
  number: 5,
  title: "Design system",
  sections: [
    {
      id: "why-web-components",
      title: "Why the shared layer is Web Components, not React",
      sayThisAloud:
        "This is a deliberate, disclosed choice to reflect my own Web Components background from Microsoft Fabric — the spec's own default recommendation was React-only components, and I'm overriding it on purpose, not because it was obviously correct for a from-scratch React app.",
      keywords: ["fastelement", "web components", "fabric", "fluent"],
      body: (
        <>
          <p>
            Button, Field, Select, RadioGroup, Dialog, Disclosure, and StatusMessage are real browser-native custom
            elements built with <code>@microsoft/fast-element</code>, registered under a <code>ds-</code> prefix (
            e.g. <code>&lt;ds-button&gt;</code>), living in <code>src/design-system/elements/&lt;name&gt;/</code>.
            React app code never touches the custom elements directly — it imports thin wrapper components from{" "}
            <code>src/design-system/react/</code> that look and behave like ordinary React components.
          </p>
          <p>
            Domain pattern components (<code>ProviderResult</code>, <code>SlotPicker</code>,{" "}
            <code>BookingSummary</code>-equivalent review rows) stayed plain React, since they're tightly bound to
            hooks and query state where a web-component boundary would add friction with no real benefit. If asked
            directly: I'd tell an interviewer this is a demonstration of transferable experience, not a claim that a
            from-scratch React codebase should default to Web Components — see Question 19 in Topic 7 for the fuller
            answer.
          </p>
        </>
      ),
    },
    {
      id: "token-layers",
      title: "Token layers",
      sayThisAloud:
        "One CSS custom-property source (tokens.css) feeds both Tailwind's theme and every FASTElement component's internal styles — there's no second copy to drift out of sync.",
      body: (
        <>
          <p>
            <code>src/design-system/tokens.css</code> defines the raw palette plus semantic roles (surface, text,
            border, action, status, focus, radius, elevation, spacing, type, motion, control sizing).{" "}
            <code>tailwind.config.ts</code> maps Tailwind's theme onto those same variables for app-shell/layout
            code; each FASTElement's <code>*.styles.ts</code> references the identical variables inside its Shadow
            DOM, because CSS custom properties pierce shadow boundaries by design (Tailwind utility classes do not).
            A production team could additionally generate this file from a{" "}
            <a href="https://www.designtokens.org/TR/2025.10/format/" className="underline">
              DTCG-format
            </a>{" "}
            token source for cross-tool exchange — not implemented here, since one authoritative CSS file is enough
            for this scope, and DTCG is a community specification, not a W3C Recommendation.
          </p>
        </>
      ),
    },
    {
      id: "composition-layers",
      title: "Three layers, one boundary rule",
      sayThisAloud:
        "Accessible behavior, shared styled components, and domain patterns are three distinct layers, and healthcare assumptions never leak into the bottom two.",
      body: (
        <>
          <ol className="list-decimal pl-6">
            <li>
              Accessible behavior — native HTML plus <code>@microsoft/fast-foundation</code>'s base classes (
              <code>Button</code>, <code>TextField</code>, <code>Select</code>, <code>ListboxOption</code>,{" "}
              <code>RadioGroup</code>, <code>Radio</code>, <code>Dialog</code>, <code>Disclosure</code>) — focus
              trap, keyboard nav, and ARIA come from these classes and their default templates, reused as-is.
            </li>
            <li>
              Shared styled components — one <code>*.styles.ts</code> per element, token-driven, plus the generic{" "}
              <code>createComponent</code> React-wrapper helper (there's no official React binding for FASTElement,
              unlike Lit's <code>@lit/react</code>).
            </li>
            <li>
              Domain patterns — <code>ProviderResult</code>, <code>SlotPicker</code>, review rows: plain React,
              composed from layer 2, carrying booking-specific meaning that layer 2 must never know about.
            </li>
          </ol>
          <p>
            A variant API of <code>intent</code>/<code>size</code>/<code>pending</code> observable attributes on{" "}
            <code>ds-button</code> replaces boolean-combination props — see it live below.
          </p>
        </>
      ),
    },
    {
      id: "gallery",
      title: "Component gallery",
      sayThisAloud:
        "This live demo changes a semantic accent token and toggles comfortable/compact density on the same real components the product uses — not a separate mockup.",
      body: <ComponentGallery />,
    },
    {
      id: "responsive-and-storybook",
      title: "Responsive behavior and Storybook",
      sayThisAloud:
        "Storybook 8 runs against the same tokens and the same wrapped components as the app — the in-app gallery above complements it, it doesn't replace it.",
      body: (
        <>
          <p>
            Stories exist for the three components the spec calls out for coverage — Button, Field, and Dialog (
            <code>src/design-system/elements/*/*.stories.tsx</code>) — covering default/secondary/destructive/
            sizes/pending/disabled/long-content states, plus a modal/non-modal comparison for Dialog. The{" "}
            <code>@storybook/addon-a11y</code> panel runs axe against every story automatically.
          </p>
          <p>
            Layout uses intrinsic Flex/Grid with Tailwind's responsive utilities rather than fixed breakpoints tied
            to specific devices; the booking screens collapse to a single column on narrow viewports without hiding
            any control, and the Scenarios drawer is a Dialog (not a fixed side panel) specifically so it inherits
            the same responsive/focus-trap behavior at any width.
          </p>
        </>
      ),
    },
    {
      id: "governance",
      title: "Accessibility and contribution governance",
      sayThisAloud:
        "The lifecycle is observed need, existing-pattern review, agreed API, implementation with stories, validation, adoption, then versioning when a contract changes.",
      body: (
        <>
          <p>
            Concretely for this repo: a new shared control starts as a one-off need inside a feature; if a second
            feature needs the same behavior, it's promoted into <code>design-system/elements</code> with its own
            template/styles/definition files, a story, and a React wrapper — never duplicated. Changing an existing
            element's public props (e.g. adding a new <code>intent</code>) is a deliberate, reviewed step because
            every consumer picks it up simultaneously; there is no per-consumer opt-in.
          </p>
          <p>
            Accessibility responsibilities split the same way React Aria's quality guidance describes: the
            foundation classes provide correct semantics and keyboard behavior as a baseline, but assembling them
            into a real flow (focus movement between wizard stages, announcing conflict/error states, keeping a
            focused control visible near the sticky review footer) remains the application's job — using an
            accessible primitive is a foundation, not proof the assembled flow is accessible.
          </p>
        </>
      ),
    },
  ],
};
