import { DesignSystem } from "@microsoft/fast-foundation";
import { buttonDefinition } from "./button.definition";

/** Registers <ds-button>. Import for its side effect, before React ever creates the tag. */
DesignSystem.getOrCreate().withPrefix("ds").register(buttonDefinition());
