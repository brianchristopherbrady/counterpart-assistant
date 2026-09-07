import { css } from "@microsoft/fast-element";

export const optionStyles = css`
  :host {
    display: block;
    box-sizing: border-box;
    padding: var(--cb-space-2) var(--cb-space-3);
    border-radius: var(--cb-radius-sm);
    font-family: var(--cb-font-sans);
    font-size: var(--cb-font-size-md);
    color: var(--cb-text-primary);
    cursor: pointer;
  }
  :host(.selected) {
    background: var(--cb-status-info-bg);
    color: var(--cb-status-info-fg);
  }
  :host(:hover) {
    background: var(--cb-surface-sunken);
  }
  :host(.disabled) {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
