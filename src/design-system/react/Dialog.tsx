import type { ReactNode } from "react";
import { createComponent } from "./createComponent";
import type { DsDialogElement } from "@/design-system/elements/dialog";

export interface DialogProps {
  open: boolean;
  modal?: boolean;
  onDismiss?: () => void;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  children?: ReactNode;
  className?: string;
}

interface WrappedDialogProps {
  modal?: boolean;
  onDismissed?: (e: Event) => void;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

const WrappedDialog = createComponent<DsDialogElement, WrappedDialogProps>({
  tagName: "ds-dialog",
  events: { onDismissed: "dismiss" },
});

/** Mounted only while open, so focus returns to the trigger on close via normal unmount. */
export function Dialog({ open, modal = true, onDismiss, children, className, ...rest }: DialogProps) {
  if (!open) return null;
  return (
    <WrappedDialog className={className} modal={modal} onDismissed={() => onDismiss?.()} {...rest}>
      {children}
    </WrappedDialog>
  );
}
