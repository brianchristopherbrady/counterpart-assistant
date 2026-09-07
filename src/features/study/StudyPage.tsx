import { useMemo, useState } from "react";
import { Field } from "@/design-system/react";
import { STUDY_TOPICS, SEARCH_INDEX } from "./content";
import { TableOfContents } from "./components/TableOfContents";
import { StudySectionView } from "./components/StudySectionView";

export function StudyPage() {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const matches = useMemo(() => (q ? SEARCH_INDEX.filter((entry) => entry.text.includes(q)) : null), [q]);

  return (
    <div className="mx-auto flex max-w-content flex-col gap-6 p-6 md:flex-row md:items-start">
      <div className="md:w-64 md:shrink-0">
        <details className="md:hidden">
          <summary className="cursor-pointer font-semibold text-text-primary">Contents</summary>
          <TableOfContents topics={STUDY_TOPICS} className="mt-3" />
        </details>
        <div className="hidden md:sticky md:top-4 md:block">
          <TableOfContents topics={STUDY_TOPICS} />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-8">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Study</h1>
          <p className="mt-1 text-text-muted">
            An interview rehearsal guide grounded in this repository's actual implementation — see Topic 8 for the
            file map and cited sources.
          </p>
        </div>

        <div className="max-w-sm">
          <Field
            label="Search titles and questions"
            value={query}
            onValueChange={setQuery}
            placeholder="e.g. idempotency, timezone, staff"
          />
        </div>

        {matches ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-text-muted">{matches.length} result(s) for "{query}"</p>
            {matches.map((entry) => {
              const topic = STUDY_TOPICS.find((t) => t.id === entry.topicId)!;
              const section = topic.sections.find((s) => s.id === entry.sectionId)!;
              return (
                <div key={entry.sectionId} className="flex flex-col gap-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                    {topic.number}. {topic.title}
                  </p>
                  <StudySectionView section={section} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {STUDY_TOPICS.map((topic) => (
              <div key={topic.id} id={topic.id} className="flex scroll-mt-20 flex-col gap-6">
                <h2 className="text-xl font-semibold text-text-primary">
                  {topic.number}. {topic.title}
                </h2>
                {topic.sections.map((section) => (
                  <StudySectionView key={section.id} section={section} />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
