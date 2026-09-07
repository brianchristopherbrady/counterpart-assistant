import { css } from "@microsoft/fast-element";

export const selectStyles = css`
  :host {
    display: inline-block;
    width: 100%;
    font-family: var(--cb-font-sans);
    position: relative;
  }
  .control {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--cb-space-2);
    height: var(--cb-control-height-md);
    padding-inline: var(--cb-control-padding-inline);
    border-radius: var(--cb-radius-md);
    border: 1px solid var(--cb-border-default);
    background: var(--cb-surface-raised);
    color: var(--cb-text-primary);
    font-size: var(--cb-font-size-md);
    cursor: pointer;
  }
  :host(:focus-visible) .control,
  :host([open]) .control {
    outline: var(--cb-focus-ring-width) solid var(--cb-focus-ring-color);
    outline-offset: var(--cb-focus-ring-offset);
  }
  :host(.disabled) .control {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .indicator {
    color: var(--cb-text-muted);
    display: inline-flex;
  }
  .listbox {
    box-sizing: border-box;
    position: absolute;
    inset-inline: 0;
    top: calc(100% + var(--cb-space-1));
    z-index: 10;
    background: var(--cb-surface-raised);
    border: 1px solid var(--cb-border-default);
    border-radius: var(--cb-radius-md);
    box-shadow: var(--cb-elevation-2);
    max-height: 240px;
    overflow-y: auto;
    padding: var(--cb-space-1);
  }
`;
