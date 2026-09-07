import { css } from "@microsoft/fast-element";

export const radioStyles = css`
  :host {
    display: flex;
    align-items: center;
    gap: var(--cb-space-2);
    padding-block: var(--cb-space-1);
    font-family: var(--cb-font-sans);
    cursor: pointer;
  }
  .control {
    box-sizing: border-box;
    width: 18px;
    height: 18px;
    border-radius: 999px;
    border: 1.5px solid var(--cb-border-strong);
    background: var(--cb-surface-raised);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  :host([aria-checked="true"]) .control {
    border-color: var(--cb-action-primary-bg);
  }
  :host([aria-checked="true"]) .control::after {
    content: "";
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: var(--cb-action-primary-bg);
  }
  :host(:focus-visible) .control,
  :host(:focus-within) .control {
    outline: var(--cb-focus-ring-width) solid var(--cb-focus-ring-color);
    outline-offset: var(--cb-focus-ring-offset);
  }
  :host([aria-disabled="true"]) {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .label {
    font-size: var(--cb-font-size-md);
    color: var(--cb-text-primary);
  }
`;
