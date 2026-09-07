import { DsOptionElement } from "./option";
import { listboxOptionTemplate } from "./option.template";
import { optionStyles } from "./option.styles";

export const optionDefinition = DsOptionElement.compose({
  baseName: "option",
  template: listboxOptionTemplate,
  styles: optionStyles,
});
