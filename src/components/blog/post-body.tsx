import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Block, PostSection } from "@/content/posts";
import { headingId } from "@/content/posts";
import { Reveal } from "@/components/ui/reveal";

/**
 * Renders an article body.
 *
 * Server component. Sections become h2s with stable ids so the table of
 * contents can link to them; each block type has one representation and
 * inline text supports exactly two forms, `[label](href)` and `` `code` ``.
 */
export function PostBody({ sections }: { sections: PostSection[] }) {
  return (
    <div className="mt-12 flex flex-col gap-10">
      {sections.map((section, i) => (
        <Reveal key={section.heading} delayMs={Math.min(i * 30, 150)}>
          <section aria-labelledby={headingId(section.heading)}>
            <h2
              id={headingId(section.heading)}
              className="scroll-mt-24 text-xl font-semibold tracking-tight text-text sm:text-2xl"
            >
              {section.heading}
            </h2>
            <div className="mt-4 flex flex-col gap-4">
              {section.body.map((block, j) => (
                <BlockView key={j} block={block} />
              ))}
            </div>
          </section>
        </Reveal>
      ))}
    </div>
  );
}

function BlockView({ block }: { block: string | Block }) {
  if (typeof block === "string") {
    return <p className="text-base leading-relaxed text-text-muted">{inline(block)}</p>;
  }

  switch (block.type) {
    case "list": {
      const Tag = block.ordered ? "ol" : "ul";
      return (
        <Tag className={`flex flex-col gap-2 pl-1 ${block.ordered ? "list-decimal pl-6" : ""}`}>
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3 text-base leading-relaxed text-text-muted">
              {!block.ordered ? (
                <span aria-hidden="true" className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
              ) : null}
              <span>{inline(item)}</span>
            </li>
          ))}
        </Tag>
      );
    }

    case "code":
      return (
        <figure className="my-2">
          <pre className="overflow-x-auto rounded-lg border border-border bg-bg-elevated p-4 font-mono text-[13px] leading-relaxed text-text">
            <code>{block.code}</code>
          </pre>
          {block.caption || block.lang ? (
            <figcaption className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-text-faint">
              {block.lang ? <span>{block.lang}</span> : null}
              {block.lang && block.caption ? <span aria-hidden="true"> · </span> : null}
              {block.caption ? <span className="normal-case tracking-normal">{block.caption}</span> : null}
            </figcaption>
          ) : null}
        </figure>
      );

    case "callout":
      return (
        <aside className="my-2 border-l-2 border-accent pl-4">
          {block.label ? (
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent">{block.label}</p>
          ) : null}
          <p className="mt-1 text-base leading-relaxed text-text">{inline(block.text)}</p>
        </aside>
      );

    case "flow":
      return (
        <figure className="my-2">
          <ol className="flex flex-col gap-2 rounded-lg border border-border bg-bg-elevated p-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-2 sm:gap-y-3">
            {block.steps.map((step, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-md border border-border-strong bg-bg px-3 py-1.5 text-sm text-text">
                  <span className="font-mono text-[10px] text-accent">{String(i + 1).padStart(2, "0")}</span>
                  {step}
                </span>
                {i < block.steps.length - 1 ? (
                  <ArrowRight size={13} aria-hidden="true" className="shrink-0 text-text-faint" />
                ) : null}
              </li>
            ))}
          </ol>
          {block.caption ? (
            <figcaption className="mt-2 text-sm text-text-faint">{block.caption}</figcaption>
          ) : null}
        </figure>
      );

    case "image":
      return (
        <figure className="my-2">
          <Image
            src={block.src}
            alt={block.alt}
            width={block.width}
            height={block.height}
            sizes="(min-width: 768px) 704px, 100vw"
            className="h-auto w-full rounded-lg border border-border"
          />
          {block.caption ? (
            <figcaption className="mt-2 text-sm text-text-faint">{block.caption}</figcaption>
          ) : null}
        </figure>
      );

    case "table":
      return (
        <figure className="my-2 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {block.head.map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="border-b border-border-strong py-2 pr-4 text-left font-mono text-[11px] uppercase tracking-[0.14em] text-text-faint"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j} className="border-b border-border py-2.5 pr-4 align-top leading-relaxed text-text-muted">
                      {inline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {block.caption ? (
            <figcaption className="mt-2 text-sm text-text-faint">{block.caption}</figcaption>
          ) : null}
        </figure>
      );
  }
}

const INLINE = /\[([^\]]+)\]\(([^)\s]+)\)|`([^`]+)`/g;

/** `[label](href)` becomes a link, `` `code` `` becomes inline code. */
function inline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  INLINE.lastIndex = 0;

  while ((match = INLINE.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    if (match[1] && match[2]) {
      const href = match[2];
      const external = /^https?:\/\//.test(href);
      parts.push(
        external ? (
          <a
            key={match.index}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-text underline decoration-border-strong underline-offset-4 transition-colors hover:text-accent-strong hover:decoration-accent"
          >
            {match[1]}
          </a>
        ) : (
          <Link
            key={match.index}
            href={href}
            className="text-text underline decoration-border-strong underline-offset-4 transition-colors hover:text-accent-strong hover:decoration-accent"
          >
            {match[1]}
          </Link>
        )
      );
    } else if (match[3]) {
      parts.push(
        <code key={match.index} className="rounded bg-bg-elevated-2 px-1.5 py-0.5 font-mono text-[0.85em] text-text">
          {match[3]}
        </code>
      );
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length === 1 ? parts[0] : parts;
}
