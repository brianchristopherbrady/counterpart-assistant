import type { ReactNode } from "react";
import { createComponent } from "./createComponent";
import type { DsButtonElement } from "@/design-system/elements/button";

export interface ButtonProps {
  intent?: "primary" | "secondary" | "destructive";
  size?: "sm" | "md" | "lg";
  pending?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: (e: MouseEvent) => void;
  children?: ReactNode;
  className?: string;
  "aria-label"?: string;
}

const WrappedButton = createComponent<DsButtonElement, ButtonProps>({
  tagName: "ds-button",
  events: { onClick: "click" },
});

/** Disables the control while pending, in addition to the web component's visual/aria-busy hook. */
export function Button({ pending, disabled, ...rest }: ButtonProps) {
  return <WrappedButton {...rest} pending={pending} disabled={disabled || pending} />;
}
