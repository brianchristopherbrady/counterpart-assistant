import { DsRadioGroupElement } from "./radio-group";
import { radioGroupTemplate } from "./radio-group.template";
import { radioGroupStyles } from "./radio-group.styles";

export const radioGroupDefinition = DsRadioGroupElement.compose({
  baseName: "radio-group",
  template: radioGroupTemplate,
  styles: radioGroupStyles,
});
