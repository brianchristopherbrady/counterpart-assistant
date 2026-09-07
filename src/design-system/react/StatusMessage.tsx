import type { ReactNode } from "react";
import { createComponent } from "./createComponent";
import type { DsStatusMessageElement, StatusIntent } from "@/design-system/elements/status-message";

export interface StatusMessageProps {
  intent?: StatusIntent;
  children?: ReactNode;
  className?: string;
}

const WrappedStatusMessage = createComponent<DsStatusMessageElement, { intent?: StatusIntent }>({
  tagName: "ds-status-message",
});

export function StatusMessage({ intent = "info", children, className }: StatusMessageProps) {
  return (
    <WrappedStatusMessage className={className} intent={intent}>
      {children}
    </WrappedStatusMessage>
  );
}
