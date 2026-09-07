import { html } from "@microsoft/fast-element";
import type { DsStatusMessageElement } from "./status-message";

export const statusMessageTemplate = html<DsStatusMessageElement>`
  <div class="root" role="${(x) => (x.intent === "error" ? "alert" : "status")}">
    <slot></slot>
  </div>
`;
