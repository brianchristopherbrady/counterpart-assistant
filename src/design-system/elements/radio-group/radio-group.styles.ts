import { css } from "@microsoft/fast-element";

export const radioGroupStyles = css`
  :host {
    display: block;
    font-family: var(--cb-font-sans);
  }
  ::slotted([slot="label"]) {
    display: block;
    margin-block-end: var(--cb-space-2);
    font-size: var(--cb-font-size-sm);
    font-weight: var(--cb-font-weight-medium);
    color: var(--cb-text-primary);
  }
  .positioning-region {
    display: flex;
    gap: var(--cb-space-2);
  }
  .positioning-region.vertical {
    flex-direction: column;
  }
  .positioning-region.horizontal {
    flex-direction: row;
    flex-wrap: wrap;
  }
`;
