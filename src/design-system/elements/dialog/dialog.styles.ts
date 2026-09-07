import { css } from "@microsoft/fast-element";

export const dialogStyles = css`
  :host {
    display: contents;
    font-family: var(--cb-font-sans);
  }
  /* The UA [hidden]{display:none} rule loses to an unconditional :host rule unless restated here. */
  :host([hidden]) {
    display: none;
  }
  .positioning-region {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--cb-space-4);
    z-index: 50;
  }
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.5);
  }
  .control {
    position: relative;
    box-sizing: border-box;
    max-width: 32rem;
    width: 100%;
    max-height: calc(100vh - var(--cb-space-8));
    overflow-y: auto;
    background: var(--cb-surface-raised);
    color: var(--cb-text-primary);
    border-radius: var(--cb-radius-lg);
    box-shadow: var(--cb-elevation-2);
    padding: var(--cb-space-6);
  }
  .control:focus-visible {
    outline: var(--cb-focus-ring-width) solid var(--cb-focus-ring-color);
  }
`;
