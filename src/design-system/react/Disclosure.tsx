import type { ReactNode } from "react";
import { createComponent } from "./createComponent";
import type { DsDisclosureElement } from "@/design-system/elements/disclosure";

export interface DisclosureProps {
  title: string;
  expanded?: boolean;
  children?: ReactNode;
  className?: string;
}

const WrappedDisclosure = createComponent<DsDisclosureElement, { title?: string; expanded?: boolean }>({
  tagName: "ds-disclosure",
});

export function Disclosure({ title, expanded, children, className }: DisclosureProps) {
  return (
    <WrappedDisclosure className={className} title={title} expanded={expanded}>
      {children}
    </WrappedDisclosure>
  );
}
