import { attr } from "@microsoft/fast-element";
import { Button } from "@microsoft/fast-foundation";

/** Adds the token-driven variant API (intent/size/pending) on top of the accessible foundation button. */
export class DsButtonElement extends Button {
  @attr intent: "primary" | "secondary" | "destructive" = "primary";
  @attr size: "sm" | "md" | "lg" = "md";
  @attr({ mode: "boolean" }) pending = false;
}
