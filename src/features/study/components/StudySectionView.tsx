import { ExpandableAnswer } from "./ExpandableAnswer";
import type { StudySection } from "../content/types";

export function StudySectionView({ section }: { section: StudySection }) {
  return (
    <section id={section.id} className="flex scroll-mt-20 flex-col gap-3">
      <h3 className="text-lg font-semibold text-text-primary">{section.title}</h3>
      <ExpandableAnswer sayThisAloud={section.sayThisAloud}>{section.body}</ExpandableAnswer>
    </section>
  );
}
