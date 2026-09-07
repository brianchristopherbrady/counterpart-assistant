import { DsSelectElement } from "./select";
import { selectTemplate } from "./select.template";
import { selectStyles } from "./select.styles";

const CHEVRON_ICON =
  '<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';

export const selectDefinition = DsSelectElement.compose({
  baseName: "select",
  template: selectTemplate,
  styles: selectStyles,
  indicator: CHEVRON_ICON,
});
