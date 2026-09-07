import type { ReactNode } from "react";

export interface StudySection {
  id: string;
  title: string;
  /** The short spoken answer — shown first, before the expandable deeper reasoning. */
  sayThisAloud: string;
  body: ReactNode;
  /** Extra terms the section should match on besides its title/sayThisAloud text. */
  keywords?: string[];
}

export interface StudyTopic {
  id: string;
  number: number;
  title: string;
  sections: StudySection[];
}
