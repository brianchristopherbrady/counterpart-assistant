import { DesignSystem } from "@microsoft/fast-foundation";
import { radioGroupDefinition } from "./radio-group.definition";

/** Registers <ds-radio-group>. Import for its side effect, before React ever creates the tag. */
DesignSystem.getOrCreate().withPrefix("ds").register(radioGroupDefinition());
