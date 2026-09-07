import { DsFieldElement } from "./field";
import { fieldTemplate } from "./field.template";
import { fieldStyles } from "./field.styles";

export const fieldDefinition = DsFieldElement.compose({
  baseName: "field",
  template: fieldTemplate,
  styles: fieldStyles,
});
