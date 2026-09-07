import { DsButtonElement } from "./button";
import { buttonTemplate } from "./button.template";
import { buttonStyles } from "./button.styles";

export const buttonDefinition = DsButtonElement.compose({
  baseName: "button",
  template: buttonTemplate,
  styles: buttonStyles,
});
