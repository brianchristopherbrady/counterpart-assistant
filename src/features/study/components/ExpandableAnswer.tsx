import type { ReactNode } from "react";
import { Disclosure } from "@/design-system/react";

export interface ExpandableAnswerProps {
  sayThisAloud: string;
  children: ReactNode;
}

export function ExpandableAnswer({ sayThisAloud, children }: ExpandableAnswerProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="rounded-md bg-status-info-bg p-3 text-status-info-fg">
        <span className="font-semibold">Say this aloud: </span>
        {sayThisAloud}
      </p>
      <Disclosure title="Go deeper">
        <div className="flex flex-col gap-3 text-text-primary">{children}</div>
      </Disclosure>
    </div>
  );
}
