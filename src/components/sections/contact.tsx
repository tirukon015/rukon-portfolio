"use client";

import { useState } from "react";
import { Mail, Send } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/icons";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { ButtonLink } from "@/components/ui/button";
import { site } from "@/content/site";

type Status = "idle" | "sending" | "success" | "error";

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
    <section id="contact" aria-label="Contact" className="py-20 sm:py-24 lg:py-28">
      <Container>
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_1.2fr]">
          <Reveal>
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
              Contact
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
              Have a system, website, or operational workflow that needs to be improved?
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-text-muted">
              I&apos;m open to internship and full-time software engineering opportunities. Reach out
              directly, or use the form.
            </p>

            <ul className="mt-8 flex flex-col gap-4">
              <li>
                <a
                  href={site.emailHref}
                  className="inline-flex items-center gap-3 text-sm text-text transition-colors hover:text-accent-strong"
                >
                  <Mail size={16} className="text-text-faint" /> {site.email}
                </a>
              </li>
              <li>
                <a
                  href={site.links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 text-sm text-text transition-colors hover:text-accent-strong"
                >
                  <LinkedinIcon size={16} className="text-text-faint" /> LinkedIn
                </a>
              </li>
              <li>
                <a
                  href={site.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 text-sm text-text transition-colors hover:text-accent-strong"
                >
                  <GithubIcon size={16} className="text-text-faint" /> GitHub
                </a>
              </li>
            </ul>

            <div className="mt-8 flex flex-wrap gap-4">
              <ButtonLink href="/#work" variant="secondary">
                View My Work
              </ButtonLink>
              <ButtonLink href={site.resumeHref} variant="secondary" external download={site.resumeFileName}>
                Download Resume
              </ButtonLink>
            </div>
          </Reveal>

          <Reveal delayMs={100}>
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Full Name" name="name" type="text" autoComplete="name" required />
                <Field label="Email Address" name="email" type="email" autoComplete="email" required />
              </div>
              <Field label="Subject" name="subject" type="text" required />
              <div>
                <label htmlFor="message" className="block text-sm text-text-muted">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  maxLength={5000}
                  className="mt-2 w-full rounded-xl border border-border-strong bg-bg-elevated px-4 py-3 text-sm text-text outline-none transition-colors focus:border-accent"
                />
              </div>

              <button
                type="submit"
                disabled={status === "sending"}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-contrast transition-colors hover:bg-accent-strong disabled:opacity-60"
              >
                {status === "sending" ? (
                  "Sending…"
                ) : (
                  <>
                    <Send size={16} /> Send Message
                  </>
                )}
              </button>

              <div role="status" aria-live="polite" className="min-h-5 text-sm">
                {status === "success" ? (
                  <p className="text-accent-strong">Message sent. I&apos;ll get back to you soon.</p>
                ) : null}
                {status === "error" ? <p className="text-red-400">{errorMessage}</p> : null}
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
      <label htmlFor={name} className="block text-sm text-text-muted">
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
