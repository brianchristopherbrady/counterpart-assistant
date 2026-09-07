import type { StudyTopic } from "../content/types";

export function TableOfContents({ topics, className }: { topics: StudyTopic[]; className?: string }) {
  return (
    <nav className={className} aria-label="Study contents">
      <ul className="flex flex-col gap-3">
        {topics.map((topic) => (
          <li key={topic.id}>
            <a href={`#${topic.id}`} className="font-medium text-text-primary hover:underline">
              {topic.number}. {topic.title}
            </a>
            <ul className="mt-1 flex flex-col gap-1 border-l border-border pl-3">
              {topic.sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="text-sm text-text-muted hover:underline">
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  );
}
