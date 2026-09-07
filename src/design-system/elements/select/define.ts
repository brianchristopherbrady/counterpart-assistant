import { DesignSystem } from "@microsoft/fast-foundation";
import { selectDefinition } from "./select.definition";

/** Registers <ds-select>. Import for its side effect, before React ever creates the tag. */
DesignSystem.getOrCreate().withPrefix("ds").register(selectDefinition());
