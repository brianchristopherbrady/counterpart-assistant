import { css } from "@microsoft/fast-element";

export const fieldStyles = css`
  :host {
    display: block;
    font-family: var(--cb-font-sans);
  }
  .label {
    display: block;
    margin-block-end: var(--cb-space-1);
    font-size: var(--cb-font-size-sm);
    font-weight: var(--cb-font-weight-medium);
    color: var(--cb-text-primary);
  }
  .root {
    display: flex;
  }
  .control {
    box-sizing: border-box;
    width: 100%;
    height: var(--cb-control-height-md);
    padding-inline: var(--cb-control-padding-inline);
    border-radius: var(--cb-radius-md);
    border: 1px solid var(--cb-border-default);
    background: var(--cb-surface-raised);
    color: var(--cb-text-primary);
    font-size: var(--cb-font-size-md);
    font-family: inherit;
  }
  .control:focus-visible {
    outline: var(--cb-focus-ring-width) solid var(--cb-focus-ring-color);
    outline-offset: var(--cb-focus-ring-offset);
  }
  .control[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
  :host([invalid]) .control {
    border-color: var(--cb-status-error-fg);
  }
  .hint {
    margin-block-start: var(--cb-space-1);
    font-size: var(--cb-font-size-sm);
    color: var(--cb-text-muted);
  }
  .error {
    margin-block-start: var(--cb-space-1);
    font-size: var(--cb-font-size-sm);
    color: var(--cb-status-error-fg);
  }
`;
