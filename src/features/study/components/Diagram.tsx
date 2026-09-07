import { useEffect, useId, useState } from "react";

export interface DiagramProps {
  title: string;
  definition: string;
  caption: string;
}

/** Renders client-side only, on demand — mermaid is lazy-imported so it never loads outside Study. */
export function Diagram({ title, definition, caption }: DiagramProps) {
  const id = useId().replace(/:/g, "");
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    import("mermaid").then(async ({ default: mermaid }) => {
      try {
        mermaid.initialize({ startOnLoad: false, securityLevel: "strict", theme: "neutral" });
        const { svg: rendered } = await mermaid.render(`diagram-${id}`, definition);
        if (!cancelled) setSvg(rendered);
      } catch {
        if (!cancelled) setError(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [id, definition]);

  return (
    <figure className="flex flex-col gap-2 rounded-md border border-border bg-surface-raised p-4">
      <h3 className="font-semibold text-text-primary">{title}</h3>
      {error ? (
        <pre className="overflow-x-auto whitespace-pre-wrap text-xs text-text-muted">{definition}</pre>
      ) : svg ? (
        <div
          role="img"
          aria-label={title}
          className="overflow-x-auto [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <p className="text-sm text-text-muted">Loading diagram…</p>
      )}
      <figcaption className="text-sm text-text-muted">{caption}</figcaption>
    </figure>
  );
}
