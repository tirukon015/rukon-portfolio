"use client";

import { useState } from "react";
import { ArrowUpRight, Send } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { site } from "@/content/site";

type Status = "idle" | "sending" | "success" | "error";

/**
 * The closing section.
 *
 * A single question as the headline, the email address as the primary route,
 * and the form beside it for anyone who prefers one. The form still posts to
 * `/api/contact`; nothing about delivery changed here.
 */
export function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    setStatus("sending");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(json.error ?? "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please try again, or email me directly.");
    }
  }

  return (
    <section id="contact" aria-labelledby="contact-heading" className="py-20 sm:py-24 lg:py-32">
      <Container>
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-10">
          <Reveal className="lg:col-span-7">
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-accent">Contact</span>
            <h2 id="contact-heading" className="mt-4 max-w-[16ch] text-display-sm font-semibold text-text text-balance">
              Have something worth building?
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-text-muted sm:text-lg">
              I&apos;m open to roles across IT systems and operations, web development and software,
              internship or full-time. Write to me directly, or use the form.
            </p>

            <a
              href={site.emailHref}
              className="mt-8 inline-block text-xl font-medium tracking-tight text-text underline decoration-border-strong underline-offset-[8px] transition-colors hover:text-accent-strong hover:decoration-accent sm:text-2xl"
            >
              {site.email}
            </a>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
              <li>
                <a
                  href={site.links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text"
                >
                  LinkedIn <ArrowUpRight size={13} />
                </a>
              </li>
              <li>
                <a
                  href={site.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text"
                >
                  GitHub <ArrowUpRight size={13} />
                </a>
              </li>
              <li>
                <a
                  href={`${site.cvHref}?from=contact`}
                  className="inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text"
                >
                  Resume
                </a>
              </li>
            </ul>
          </Reveal>

          <Reveal delayMs={100} className="lg:col-span-5 lg:pt-2">
            <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.16em] text-text-faint">
              Or send a note
            </p>
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Field label="Name" name="name" type="text" autoComplete="name" required />
                <Field label="Email" name="email" type="email" autoComplete="email" required />
              </div>
              <Field label="Subject" name="subject" type="text" required />
              <div>
                <label htmlFor="message" className="block font-mono text-[11px] uppercase tracking-[0.16em] text-text-faint">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  maxLength={5000}
                  className="mt-2 w-full resize-y border-b border-border-strong bg-transparent px-0 py-2.5 text-base text-text outline-none transition-colors focus:border-accent"
                />
              </div>

              <div className="flex flex-wrap items-center gap-5">
                <Button type="submit" disabled={status === "sending"}>
                  {status === "sending" ? (
                    "Sending…"
                  ) : (
                    <>
                      Send message <Send size={15} />
                    </>
                  )}
                </Button>
                <div role="status" aria-live="polite" className="text-sm">
                  {status === "success" ? (
                    <p className="text-accent-strong">Sent. I&apos;ll get back to you soon.</p>
                  ) : null}
                  {status === "error" ? <p className="text-text">{errorMessage}</p> : null}
                </div>
              </div>
            </form>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

function Field({
  label,
  name,
  type,
  autoComplete,
  required,
}: {
  label: string;
  name: string;
  type: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block font-mono text-[11px] uppercase tracking-[0.16em] text-text-faint">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        className="mt-2 w-full rounded-xl border border-border-strong bg-bg-elevated px-4 py-3 text-sm text-text outline-none transition-colors focus:border-accent"
      />
    </div>
  );
}
