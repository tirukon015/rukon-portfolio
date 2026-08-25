import { GraduationCap, BadgeCheck, ExternalLink } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { education, certifications } from "@/content/education";

export function Education() {
  return (
    <section id="education" aria-label="Education and certifications" className="border-b border-border py-20">
      <Container>
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-2">
          <Reveal>
            <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-text-faint">
              Education
            </h2>
            <ul className="mt-6 flex flex-col gap-5">
              {education.map((entry) => (
                <li key={entry.degree} className="flex gap-4">
                  <GraduationCap size={18} className="mt-1 shrink-0 text-text-faint" />
                  <div>
                    <p className="text-sm font-medium text-text">{entry.degree}</p>
                    <p className="text-sm text-text-muted">{entry.institution}</p>
                    <p className="mt-0.5 text-xs text-text-faint">
                      {entry.period} · {entry.status}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delayMs={80}>
            <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-text-faint">
              Certifications
            </h2>
            <ul className="mt-6 flex flex-col gap-5">
              {certifications.map((cert) => (
                <li key={cert.title} className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <BadgeCheck size={18} className="mt-1 shrink-0 text-text-faint" />
                    <div>
                      <p className="text-sm font-medium text-text">{cert.title}</p>
                      <p className="text-sm text-text-muted">{cert.issuer}</p>
                      <p className="mt-0.5 text-xs text-text-faint">{cert.date}</p>
                    </div>
                  </div>
                  {cert.verifyHref ? (
                    <a
                      href={cert.verifyHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Verify ${cert.title}`}
                      className="mt-1 text-text-faint transition-colors hover:text-accent-strong"
                    >
                      <ExternalLink size={16} />
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
