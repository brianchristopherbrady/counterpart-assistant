import { DesignSystem } from "@microsoft/fast-foundation";
import { disclosureDefinition } from "./disclosure.definition";

/** Registers <ds-disclosure>. Import for its side effect, before React ever creates the tag. */
DesignSystem.getOrCreate().withPrefix("ds").register(disclosureDefinition());
