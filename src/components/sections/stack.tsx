import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { Tag } from "@/components/ui/tag";
import { stack } from "@/content/skills";

export function Stack() {
  return (
    <section id="stack" aria-label="Technical stack" className="border-b border-border py-20 sm:py-24 lg:py-28">
      <Container>
        <SectionHeading
          eyebrow="Technical Stack"
          title="Tools I build with."
          description="Tiered rather than listed flat. Appearing in a dependency file is not the same as having built something substantial with it."
        />

        <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2">
          {stack.map((group, i) => (
            <Reveal key={group.category} delayMs={i * 60}>
              <h3 className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
                {group.category}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-faint">{group.note}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <Tag key={item}>{item}</Tag>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
