import { ChevronDown } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { faqs } from "@/content/faq";

/**
 * Native <details>/<summary> accordion: keyboard-accessible and toggleable
 * out of the box, no client JS needed for the interaction itself.
 */
export function Faq() {
  return (
    <section id="faq" aria-label="Frequently asked questions" className="border-b border-border py-28">
      <Container className="max-w-3xl">
        <SectionHeading eyebrow="FAQ" title="A few questions people ask." />

        <div className="mt-12 flex flex-col divide-y divide-border border-t border-b border-border">
          {faqs.map((item, i) => (
            <Reveal key={item.question} delayMs={Math.min(i * 30, 150)}>
              <details className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium text-text marker:content-none [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <ChevronDown
                    size={18}
                    className="shrink-0 text-text-faint transition-transform duration-200 group-open:rotate-180"
                  />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-text-muted">{item.answer}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
