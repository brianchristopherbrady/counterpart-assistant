import { DesignSystem } from "@microsoft/fast-foundation";
import { radioDefinition } from "./radio.definition";

/** Registers <ds-radio>. Import for its side effect, before React ever creates the tag. */
DesignSystem.getOrCreate().withPrefix("ds").register(radioDefinition());
