import { FASTElement } from "@microsoft/fast-element";
import { DsStatusMessageElement } from "./status-message";
import { statusMessageDefinition } from "./status-message.definition";

/** Registers <ds-status-message>. Import for its side effect, before React ever creates the tag. */
FASTElement.define(DsStatusMessageElement, statusMessageDefinition);
