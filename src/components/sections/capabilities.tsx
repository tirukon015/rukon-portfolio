import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { capabilities } from "@/content/skills";

export function Capabilities() {
  return (
    <section id="capabilities" aria-label="What I do" className="border-b border-border py-28">
      <Container>
        <SectionHeading eyebrow="What I Do" title="Where my work sits." />

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((cap, i) => (
            <Reveal
              key={cap.title}
              delayMs={i * 50}
              className="rounded-2xl border border-border bg-bg-elevated p-6"
            >
              <h3 className="text-sm font-semibold text-text">{cap.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">{cap.description}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
