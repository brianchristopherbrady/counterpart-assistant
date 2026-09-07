import { attr, observable, volatile } from "@microsoft/fast-element";
import { TextField } from "@microsoft/fast-foundation";

/**
 * Labeled single-line text field with optional hint/error regions, associated via
 * aria-describedby to the internal input — all three live in the same shadow root, so the
 * association works without the cross-tree label/id problems that come from slotting a
 * native control from light DOM into a shadow-DOM label.
 */
export class DsFieldElement extends TextField {
  @observable hint?: string;
  @observable errorMessage?: string;
  @attr({ mode: "boolean" }) invalid = false;
  @attr autocomplete?: string;

  @volatile
  get describedByIds(): string | null {
    const ids: string[] = [];
    if (this.hint) ids.push("hint");
    if (this.errorMessage) ids.push("error");
    return ids.length ? ids.join(" ") : null;
  }
}
