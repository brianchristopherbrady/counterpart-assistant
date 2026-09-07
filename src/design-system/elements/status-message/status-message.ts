import { attr, FASTElement } from "@microsoft/fast-element";

export type StatusIntent = "info" | "success" | "warning" | "error";

/** Persistent inline status/failure surface — deliberately not a toast, per the a11y requirement. */
export class DsStatusMessageElement extends FASTElement {
  @attr intent: StatusIntent = "info";
}
