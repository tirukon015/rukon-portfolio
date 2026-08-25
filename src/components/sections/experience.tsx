import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { experience } from "@/content/experience";
import { cn } from "@/lib/utils";

export function Experience() {
  return (
    <section id="experience" aria-label="Professional experience" className="border-b border-border py-28">
      <Container>
        <SectionHeading eyebrow="Experience" title="Where the work happened." />

        <div className="mt-14 flex flex-col gap-6">
          {experience.map((entry, i) => (
            <Reveal key={entry.org + entry.role} delayMs={i * 100}>
              <div
                className={cn(
                  "rounded-2xl border border-border p-8",
                  entry.primary ? "bg-bg-elevated" : "bg-transparent"
                )}
              >
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-baseline">
                  <div>
                    <h3 className="text-xl font-semibold text-text">{entry.role}</h3>
                    <p className="mt-1 text-sm text-text-muted">
                      {entry.org} · {entry.location}
                    </p>
                  </div>
                  <span className="font-mono text-xs uppercase tracking-wide text-text-faint">
                    {entry.period}
                  </span>
                </div>

                <p className="mt-4 text-sm text-text-muted">{entry.summary}</p>

                <ul className="mt-5 flex flex-col gap-2.5">
                  {entry.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3 text-sm leading-relaxed text-text-muted">
                      <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
