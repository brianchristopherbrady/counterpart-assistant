import { DesignSystem } from "@microsoft/fast-foundation";
import { optionDefinition } from "./option.definition";

/** Registers <ds-option>. Import for its side effect, before React ever creates the tag. */
DesignSystem.getOrCreate().withPrefix("ds").register(optionDefinition());
