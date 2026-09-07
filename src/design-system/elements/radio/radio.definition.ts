import { DsRadioElement } from "./radio";
import { radioTemplate } from "./radio.template";
import { radioStyles } from "./radio.styles";

export const radioDefinition = DsRadioElement.compose({
  baseName: "radio",
  template: radioTemplate,
  styles: radioStyles,
});
