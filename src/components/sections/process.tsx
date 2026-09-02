import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { process, processNote } from "@/content/process";

export function Process() {
  return (
    <section id="process" aria-label="How I work" className="border-b border-border py-20 sm:py-24 lg:py-28">
      <Container>
        <SectionHeading eyebrow="How I Work" title="From problem to production." />

        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {process.map((step, i) => (
            <Reveal key={step.number} delayMs={i * 60}>
              <span className="font-mono text-sm text-accent">{step.number}</span>
              <h3 className="mt-2 text-lg font-semibold text-text">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">{step.description}</p>
            </Reveal>
          ))}
        </div>

        <Reveal delayMs={260} className="mt-12 max-w-2xl border-t border-border pt-8">
          <p className="text-sm leading-relaxed text-text-muted">
            {processNote}{" "}
            <Link href="/work/rpoms" className="text-accent-strong transition-colors hover:text-accent">
              See how in the RPOMS case study.
            </Link>
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
