import { DsDialogElement } from "./dialog";
import { dialogTemplate } from "./dialog.template";
import { dialogStyles } from "./dialog.styles";

export const dialogDefinition = DsDialogElement.compose({
  baseName: "dialog",
  template: dialogTemplate,
  styles: dialogStyles,
});
