import { DesignSystem } from "@microsoft/fast-foundation";
import { fieldDefinition } from "./field.definition";

/** Registers <ds-field>. Import for its side effect, before React ever creates the tag. */
DesignSystem.getOrCreate().withPrefix("ds").register(fieldDefinition());
