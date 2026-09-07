import { html, ref, slotted, when } from "@microsoft/fast-element";
import { whitespaceFilter } from "@microsoft/fast-foundation";
import type { DsFieldElement } from "./field";

export const fieldTemplate = html<DsFieldElement>`
  <template class="${(x) => (x.readOnly ? "readonly" : "")}">
    <label part="label" for="control" class="label">
      <slot ${slotted({ property: "defaultSlottedNodes", filter: whitespaceFilter })}></slot>
      ${(x) => (x.required ? html`<span class="required-indicator" aria-hidden="true"> *</span>` : "")}
    </label>
    <div class="root" part="root">
      <input
        class="control"
        part="control"
        id="control"
        @input="${(x) => x.handleTextInput()}"
        @change="${(x) => x.handleChange()}"
        ?autofocus="${(x) => x.autofocus}"
        ?disabled="${(x) => x.disabled}"
        placeholder="${(x) => x.placeholder}"
        ?readonly="${(x) => x.readOnly}"
        ?required="${(x) => x.required}"
        :value="${(x) => x.value}"
        type="${(x) => x.type}"
        autocomplete="${(x) => x.autocomplete}"
        aria-invalid="${(x) => (x.invalid ? "true" : null)}"
        aria-describedby="${(x) => x.describedByIds}"
        ${ref("control")}
      />
    </div>
    ${when((x) => x.hint, html<DsFieldElement>`<div class="hint" part="hint" id="hint">${(x) => x.hint}</div>`)}
    ${when(
      (x) => x.errorMessage,
      html<DsFieldElement>`<div class="error" part="error" id="error" role="alert">${(x) => x.errorMessage}</div>`,
    )}
  </template>
`;
