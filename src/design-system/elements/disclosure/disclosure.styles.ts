import { css } from "@microsoft/fast-element";

export const disclosureStyles = css`
  :host {
    display: block;
    font-family: var(--cb-font-sans);
  }
  .disclosure {
    border: 1px solid var(--cb-border-default);
    border-radius: var(--cb-radius-md);
    padding: var(--cb-space-3) var(--cb-space-4);
  }
  .invoker {
    display: flex;
    align-items: center;
    gap: var(--cb-space-2);
    cursor: pointer;
    font-weight: var(--cb-font-weight-medium);
    color: var(--cb-text-primary);
    list-style: none;
  }
  .invoker::-webkit-details-marker {
    display: none;
  }
  .invoker:focus-visible {
    outline: var(--cb-focus-ring-width) solid var(--cb-focus-ring-color);
    outline-offset: var(--cb-focus-ring-offset);
  }
  #disclosure-content {
    padding-block-start: var(--cb-space-3);
    color: var(--cb-text-primary);
  }
`;
