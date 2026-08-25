import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { Tag } from "@/components/ui/tag";
import { stack } from "@/content/skills";

export function Stack() {
  return (
    <section id="stack" aria-label="Technical stack" className="border-b border-border py-28">
      <Container>
        <SectionHeading eyebrow="Technical Stack" title="Tools I build with." />

        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {stack.map((group, i) => (
            <Reveal key={group.category} delayMs={i * 60}>
              <h3 className="font-mono text-xs uppercase tracking-[0.14em] text-text-faint">
                {group.category}
              </h3>
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
