import { css } from "@microsoft/fast-element";

export const statusMessageStyles = css`
  :host {
    display: block;
    font-family: var(--cb-font-sans);
  }
  .root {
    display: flex;
    gap: var(--cb-space-2);
    align-items: flex-start;
    border-radius: var(--cb-radius-md);
    padding: var(--cb-space-3) var(--cb-space-4);
    font-size: var(--cb-font-size-sm);
    line-height: var(--cb-line-height-normal);
  }
  :host([intent="info"]) .root {
    background: var(--cb-status-info-bg);
    color: var(--cb-status-info-fg);
  }
  :host([intent="success"]) .root {
    background: var(--cb-status-success-bg);
    color: var(--cb-status-success-fg);
  }
  :host([intent="warning"]) .root {
    background: var(--cb-status-warning-bg);
    color: var(--cb-status-warning-fg);
  }
  :host([intent="error"]) .root {
    background: var(--cb-status-error-bg);
    color: var(--cb-status-error-fg);
  }
`;
