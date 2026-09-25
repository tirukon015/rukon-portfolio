"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Download, FileText, Lock, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Button, ButtonLink } from "@/components/ui/button";
import { cv, protectedContactFields, type ProtectedContactKey } from "@/content/cv";

type Contact = Record<ProtectedContactKey, string>;

/** locked -> form -> submitting -> granted */
type State = "locked" | "form" | "submitting" | "granted";

const SESSION_KEY = "cv-access-granted";

export function CVAccess({ source = "direct" }: { source?: string }) {
  const [state, setState] = useState<State>("locked");
  const [contact, setContact] = useState<Contact | null>(null);
  const [documentAvailable, setDocumentAvailable] = useState<boolean>(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ fullName?: string; email?: string }>({});

  const nameId = useId();
  const emailId = useId();
  const panelId = useId();

  const nameRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const granted = contact !== null;

  /**
   * Ask the server whether this browser already holds a grant.
   *
   * The grant is an httpOnly cookie, so the page cannot read it. Asking the
   * route is the only way to know, and it is also the right way: the server
   * stays the authority on whether the values are released, and a returning
   * visitor inside the grant window does not fill the form twice.
   */
  const fetchContact = useCallback(async (): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/cv/contact");
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        return { ok: false, error: json?.error ?? "Contact details are temporarily unavailable." };
      }
      if (!json?.contact) {
        return { ok: false, error: "Invalid contact response from server." };
      }
      setContact(json.contact as Contact);
      if (typeof json.documentAvailable === "boolean") {
        setDocumentAvailable(json.documentAvailable);
      }
      return { ok: true };
    } catch {
      return { ok: false, error: "Network error loading contact details." };
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    // Only worth a request if this tab has been granted before; otherwise every
    // first-time visitor pays for a guaranteed 401.
    let seen = false;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      seen = false;
    }
    if (!seen) return;

    void (async () => {
      const res = await fetchContact();
      if (!res.ok && !cancelled) {
        // The grant expired. Clear the hint so the next load does not retry.
        try {
          sessionStorage.removeItem(SESSION_KEY);
        } catch {
          /* nothing to clean up */
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fetchContact]);

  useEffect(() => {
    if (state === "form") nameRef.current?.focus();
  }, [state]);

  function openForm() {
    setState("form");
    panelRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "submitting") return; // guards a double submit

    const data = new FormData(e.currentTarget);
    const fullName = String(data.get("fullName") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();

    const next: { fullName?: string; email?: string } = {};
    if (!fullName) next.fullName = "Please enter your name.";
    if (!email) next.email = "Please enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email address.";

    setFieldErrors(next);
    if (Object.keys(next).length > 0) {
      if (next.fullName) nameRef.current?.focus();
      return;
    }

    setState("submitting");
    setError("");

    try {
      const res = await fetch("/api/cv/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, source }),
      });
      const json = await res.json();

      if (!res.ok) {
        setState("form");
        setError(json.error ?? "Something went wrong. Please try again.");
        return;
      }

      // One submission, then a single fetch that fills all three fields at once.
      const contactRes = await fetchContact();
      if (!contactRes.ok) {
        setState("form");
        setError(contactRes.error ?? "Access was granted but the details could not be loaded. Please try again.");
        return;
      }

      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* access still works for this page view */
      }
      setState("granted");
    } catch {
      setState("form");
      setError("Network error. Please try again, or reach me through LinkedIn.");
    }
  }

  return (
    <section aria-label="Curriculum vitae" className="py-16 sm:py-20 lg:py-24">
      <Container>
        <Reveal>
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
            Curriculum Vitae
          </span>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-text sm:text-5xl">
            {cv.name}
          </h1>
          <p className="mt-3 max-w-3xl text-base text-text-muted sm:text-lg">{cv.title}</p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[1.5fr_1fr] lg:items-start">
          {/* ---------------- The CV itself, public ---------------- */}
          <div className="flex flex-col gap-10">
            <Reveal delayMs={60}>
              <Block title="Career Summary">
                <ul className="flex flex-col gap-2.5">
                  {cv.summary.map((line) => (
                    <Bullet key={line}>{line}</Bullet>
                  ))}
                </ul>
              </Block>
            </Reveal>

            <Reveal delayMs={80}>
              <Block title="Key Proficiencies">
                <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {cv.proficiencies.map((group) => (
                    <div key={group.heading}>
                      <dt className="text-sm font-medium text-text">{group.heading}</dt>
                      <dd className="mt-1 text-sm leading-relaxed text-text-muted">
                        {group.items.join(" ")}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Block>
            </Reveal>

            <Reveal delayMs={100}>
              <Block title="Experience & Activities">
                <div className="flex flex-col gap-6">
                  {cv.experience.map((role) => (
                    <div key={role.title}>
                      <h3 className="text-sm font-semibold text-text">{role.title}</h3>
                      {role.org ? (
                        <p className="mt-0.5 text-sm text-text-faint">{role.org}</p>
                      ) : null}
                      {role.meta ? (
                        <p className="mt-0.5 font-mono text-xs text-text-faint">{role.meta}</p>
                      ) : null}
                      <p className="mt-2 text-sm leading-relaxed text-text-muted">{role.body}</p>
                    </div>
                  ))}
                </div>
              </Block>
            </Reveal>

            <Reveal delayMs={120}>
              <Block title="Academic Qualification">
                <div className="flex flex-col gap-5">
                  {cv.education.map((entry) => (
                    <div key={entry.institution}>
                      <h3 className="text-sm font-semibold text-text">
                        {entry.institution}{" "}
                        <span className="font-normal text-text-faint">{entry.location}</span>
                      </h3>
                      <p className="mt-0.5 text-sm text-text-muted">{entry.award}</p>
                      <p className="mt-0.5 font-mono text-xs text-text-faint">{entry.meta}</p>
                    </div>
                  ))}
                </div>
              </Block>
            </Reveal>

            <Reveal delayMs={140}>
              <Block title="Training">
                <SectionList sections={cv.training} />
              </Block>
            </Reveal>

            <Reveal delayMs={160}>
              <Block title="Volunteer Activities">
                <SectionList sections={cv.volunteer} />
              </Block>
            </Reveal>

            <Reveal delayMs={180}>
              <Block title="Professional Development">
                <ul className="flex flex-col gap-2.5">
                  {cv.professionalDevelopment.map((line) => (
                    <Bullet key={line}>{line}</Bullet>
                  ))}
                </ul>
              </Block>
            </Reveal>

            <Reveal delayMs={200}>
              <Block title="Skills & Languages">
                <dl className="flex flex-col gap-4">
                  <Row label="Soft skills" value={cv.softSkills.join(", ")} />
                  <Row label="Computer skills" value={cv.computerSkills.join("; ")} />
                  <Row label="Languages" value={cv.languages.join(", ")} />
                </dl>
              </Block>
            </Reveal>
          </div>

          {/* ---------------- Contact, three gated fields ---------------- */}
          <Reveal delayMs={100}>
            <div
              ref={panelRef}
              className="flex flex-col gap-6 rounded-2xl border border-border bg-bg-elevated p-8 shadow-[var(--shadow-card)] lg:sticky lg:top-24"
            >
              <div>
                <h2 className="text-sm font-semibold text-text">Contact</h2>
                <p className="mt-1 text-xs leading-relaxed text-text-faint">
                  {granted
                    ? "Released for this session. Please keep these to the people who need them."
                    : "Three fields are held back. Everything else on this page is open."}
                </p>
              </div>

              <dl className="flex flex-col gap-5">
                {protectedContactFields.map((field) => (
                  <ProtectedField
                    key={field.key}
                    label={field.label}
                    placeholderWidth={field.placeholderWidth}
                    value={contact?.[field.key]}
                    onRequest={openForm}
                    busy={state === "submitting"}
                  />
                ))}

                {cv.links.map((link) => (
                  <div key={link.label}>
                    <dt className="font-mono text-[11px] uppercase tracking-wide text-text-faint">
                      {link.label}
                    </dt>
                    <dd className="mt-1 text-sm">
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-text transition-colors hover:text-accent-strong"
                      >
                        {link.value}
                      </a>
                    </dd>
                  </div>
                ))}
              </dl>

              {state === "form" || state === "submitting" ? (
                <form
                  id={panelId}
                  onSubmit={handleSubmit}
                  noValidate
                  className="flex flex-col gap-4 border-t border-border pt-6"
                >
                  <p className="text-sm leading-relaxed text-text-muted">
                    Enter your name and email to view the protected contact details.
                  </p>

                  <div>
                    <label htmlFor={nameId} className="block text-sm text-text-muted">
                      Full Name
                    </label>
                    <input
                      ref={nameRef}
                      id={nameId}
                      name="fullName"
                      type="text"
                      autoComplete="name"
                      required
                      aria-invalid={fieldErrors.fullName ? true : undefined}
                      aria-describedby={fieldErrors.fullName ? `${nameId}-error` : undefined}
                      className="mt-2 w-full rounded-xl border border-border-strong bg-bg-elevated px-4 py-3 text-sm text-text outline-none transition-colors focus:border-accent"
                    />
                    {fieldErrors.fullName ? (
                      <p id={`${nameId}-error`} className="mt-2 text-sm text-red-400">
                        {fieldErrors.fullName}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label htmlFor={emailId} className="block text-sm text-text-muted">
                      Email
                    </label>
                    <input
                      id={emailId}
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      required
                      aria-invalid={fieldErrors.email ? true : undefined}
                      aria-describedby={fieldErrors.email ? `${emailId}-error` : undefined}
                      className="mt-2 w-full rounded-xl border border-border-strong bg-bg-elevated px-4 py-3 text-sm text-text outline-none transition-colors focus:border-accent"
                    />
                    {fieldErrors.email ? (
                      <p id={`${emailId}-error`} className="mt-2 text-sm text-red-400">
                        {fieldErrors.email}
                      </p>
                    ) : null}
                  </div>

                  <Button type="submit" disabled={state === "submitting"} className="w-full">
                    {state === "submitting" ? "Requesting…" : "Request Access"}
                  </Button>

                  <p className="text-xs leading-relaxed text-text-faint">
                    Recorded as an access log. This is not identity verification.
                  </p>

                  <div role="status" aria-live="polite" className="min-h-5 text-sm">
                    {error ? <p className="text-red-400">{error}</p> : null}
                  </div>
                </form>
              ) : null}

              <div className="border-t border-border pt-6">
                {granted ? (
                  <div className="flex flex-col gap-4">
                    <p className="inline-flex items-center gap-2 text-sm font-medium text-text">
                      <ShieldCheck size={16} className="text-accent" /> Access granted
                    </p>

                    {documentAvailable ? (
                      <div className="flex flex-col gap-2.5 sm:flex-row">
                        <ButtonLink
                          href="/api/cv/document?disposition=inline"
                          variant="primary"
                          external
                          className="flex-1"
                        >
                          <FileText size={16} /> View CV
                        </ButtonLink>
                        <ButtonLink
                          href="/api/cv/document?disposition=attachment"
                          variant="secondary"
                          external
                          className="flex-1"
                        >
                          <Download size={16} /> Download CV
                        </ButtonLink>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-text-muted">
                        <p className="font-semibold text-amber-400">PDF Document Pending Setup</p>
                        <p className="mt-1 leading-relaxed text-text-faint">
                          Contact details have been unlocked above. The full CV PDF file can be placed at{" "}
                          <code className="rounded bg-bg px-1 py-0.5 font-mono text-[11px] text-text">
                            private/cv/Touhidul-Islam-Rukon-CV.pdf
                          </code>{" "}
                          or configured via <code className="rounded bg-bg px-1 py-0.5 font-mono text-[11px] text-text">CV_DOCUMENT_URL</code>.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <p className="text-xs leading-relaxed text-text-faint">
                      The full CV file includes these contact details, so viewing and downloading unlock together with
                      the same request.
                    </p>
                    <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
                      <Button
                        type="button"
                        variant="primary"
                        onClick={openForm}
                        className="flex-1"
                      >
                        <Lock size={15} /> View CV
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={openForm}
                        className="flex-1"
                      >
                        <Download size={15} /> Download CV
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

/**
 * One gated field.
 *
 * Locked, this renders a bar of placeholder geometry: there is no real value in
 * the markup to un-blur, because the value has not been sent to this browser at
 * all. The blur is on the placeholder, so it is decoration rather than
 * protection, and removing it in devtools reveals a grey rectangle.
 *
 * Granted, all three fill at once from a single response, and the transition is
 * a fade and a short rise using the tokens already in the design system.
 */
function ProtectedField({
  label,
  placeholderWidth,
  value,
  onRequest,
  busy,
}: {
  label: string;
  placeholderWidth: string;
  value?: string;
  onRequest: () => void;
  busy: boolean;
}) {
  const revealed = typeof value === "string" && value.length > 0;

  return (
    <div>
      <dt className="font-mono text-[11px] uppercase tracking-wide text-text-faint">{label}</dt>
      <dd className="mt-1">
        {revealed ? (
          <span
            key="revealed"
            className="block animate-[cv-reveal_420ms_var(--ease-out)_both] text-sm break-words text-text"
          >
            {value}
          </span>
        ) : (
          <button
            type="button"
            onClick={onRequest}
            disabled={busy}
            aria-label={`${label} is protected. Request access to view it.`}
            className="group flex w-full flex-col items-start gap-1.5 rounded-lg text-left outline-none focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-60"
          >
            <span
              aria-hidden="true"
              style={{ width: placeholderWidth }}
              className="h-4 max-w-full rounded bg-bg-elevated-2 blur-[3px] transition-colors duration-300 group-hover:bg-border-strong"
            />
            <span className="inline-flex items-center gap-1.5 text-xs text-text-faint transition-colors duration-200 group-hover:text-accent-strong">
              <Lock size={11} /> Click to view
            </span>
          </button>
        )}
      </dd>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-accent">{title}</h2>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3 text-sm leading-relaxed text-text-muted">
      <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
      <span>{children}</span>
    </li>
  );
}

function SectionList({ sections }: { sections: readonly { heading: string; items: readonly string[] }[] }) {
  return (
    <div className="flex flex-col gap-5">
      {sections.map((section) => (
        <div key={section.heading}>
          <h3 className="text-sm font-semibold text-text">{section.heading}</h3>
          <p className="mt-1 text-sm leading-relaxed text-text-muted">{section.items.join(" ")}</p>
        </div>
      ))}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <dt className="font-mono text-[11px] uppercase tracking-wide text-text-faint">{label}</dt>
      <dd className="text-sm leading-relaxed text-text-muted">{value}</dd>
    </div>
  );
}
