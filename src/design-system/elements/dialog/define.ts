import { DesignSystem } from "@microsoft/fast-foundation";
import { dialogDefinition } from "./dialog.definition";

/** Registers <ds-dialog>. Import for its side effect, before React ever creates the tag. */
DesignSystem.getOrCreate().withPrefix("ds").register(dialogDefinition());
