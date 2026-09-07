import { css } from "@microsoft/fast-element";

export const buttonStyles = css`
  :host {
    display: inline-flex;
    font-family: var(--cb-font-sans);
  }
  .control {
    all: unset;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--cb-space-2);
    cursor: pointer;
    font-weight: var(--cb-font-weight-medium);
    border-radius: var(--cb-radius-md);
    border: 1px solid transparent;
    transition: background-color var(--cb-motion-duration-normal) ease;
    height: var(--cb-control-height-md);
    padding-inline: var(--cb-space-4);
    font-size: var(--cb-font-size-md);
    white-space: nowrap;
  }
  :host([size="sm"]) .control {
    height: var(--cb-control-height-sm);
    padding-inline: var(--cb-space-3);
    font-size: var(--cb-font-size-sm);
  }
  :host([size="lg"]) .control {
    height: var(--cb-control-height-lg);
    padding-inline: var(--cb-space-6);
    font-size: var(--cb-font-size-lg);
  }
  :host([intent="primary"]) .control {
    background: var(--cb-action-primary-bg);
    color: var(--cb-action-primary-fg);
  }
  :host([intent="primary"]) .control:hover {
    background: var(--cb-action-primary-bg-hover);
  }
  :host([intent="secondary"]) .control {
    background: var(--cb-action-secondary-bg);
    color: var(--cb-action-secondary-fg);
    border-color: var(--cb-action-secondary-border);
  }
  :host([intent="secondary"]) .control:hover {
    background: var(--cb-action-secondary-bg-hover);
  }
  :host([intent="destructive"]) .control {
    background: var(--cb-action-destructive-bg);
    color: var(--cb-action-destructive-fg);
  }
  :host([intent="destructive"]) .control:hover {
    background: var(--cb-action-destructive-bg-hover);
  }
  .control:focus-visible {
    outline: var(--cb-focus-ring-width) solid var(--cb-focus-ring-color);
    outline-offset: var(--cb-focus-ring-offset);
  }
  .control[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
  :host([pending]) .control {
    opacity: 0.75;
    cursor: progress;
  }
`;
