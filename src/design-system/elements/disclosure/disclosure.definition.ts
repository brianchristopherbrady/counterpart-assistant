import { DsDisclosureElement } from "./disclosure";
import { disclosureTemplate } from "./disclosure.template";
import { disclosureStyles } from "./disclosure.styles";

export const disclosureDefinition = DsDisclosureElement.compose({
  baseName: "disclosure",
  template: disclosureTemplate,
  styles: disclosureStyles,
});
