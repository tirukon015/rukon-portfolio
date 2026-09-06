"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { Download, FileText, Lock, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Button, ButtonLink } from "@/components/ui/button";
import { site } from "@/content/site";

/**
 * LOCKED -> FORM -> SUBMITTING -> GRANTED
 *
 * `GRANTED` only controls what this component renders. It is not what protects
 * the document: the API route verifies a signed cookie the server issued, so
 * setting this state in devtools reveals nothing.
 */
type State = "locked" | "form" | "submitting" | "granted";

const SESSION_KEY = "cv-access-granted";

const noopSubscribe = () => () => {};

/**
 * Whether this tab already completed the form.
 *
 * Read through `useSyncExternalStore` rather than in an effect, matching
 * `useMounted` and `useMediaQuery` elsewhere in this codebase: the server
 * snapshot is `false`, so the markup sent from the server is always the locked
 * state and there is nothing to mismatch on hydration.
 */
function useSessionGranted(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => {
      try {
        return sessionStorage.getItem(SESSION_KEY) === "1";
      } catch {
        // Private mode or blocked storage. The form simply shows again.
        return false;
      }
    },
    () => false
  );
}

export function CVAccess({ source = "direct" }: { source?: string }) {
  const [state, setState] = useState<State>("locked");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ fullName?: string; email?: string }>({});

  const nameId = useId();
  const emailId = useId();
  const nameErrorId = `${nameId}-error`;
  const emailErrorId = `${emailId}-error`;

  const sessionGranted = useSessionGranted();
  const granted = state === "granted" || sessionGranted;

  const formRef = useRef<HTMLFormElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const grantedHeadingRef = useRef<HTMLHeadingElement>(null);

  // Move focus to whatever just replaced the previous step, so the flow is
  // followable without a mouse.
  useEffect(() => {
    if (state === "form") nameRef.current?.focus();
    if (granted) grantedHeadingRef.current?.focus();
  }, [state, granted]);

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

      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // Non-fatal: access still works for this page view.
      }
      setState("granted");
    } catch {
      setState("form");
      setError("Network error. Please try again, or email me directly.");
    }
  }

  return (
    <section aria-label="CV access" className="py-20 sm:py-24 lg:py-28">
      <Container>
        <Reveal>
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
            Curriculum Vitae
          </span>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-text sm:text-5xl">
            {granted ? "Confidential CV" : "My CV is available on request."}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-text-muted">
            {granted
              ? "Access granted for this session. The document below is the current version."
              : "The full CV carries contact details that aren't published on this site, so it sits behind a short form. Tell me who you are and it opens straight away."}
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[1.25fr_1fr] lg:items-start">
          <Reveal delayMs={80}>
            {granted ? <Viewer headingRef={grantedHeadingRef} /> : <LockedPreview />}
          </Reveal>

          <Reveal delayMs={140}>
            <div className="rounded-2xl border border-border bg-bg-elevated p-8 shadow-[var(--shadow-card)]">
              {granted ? (
                <GrantedPanel />
              ) : state === "locked" ? (
                <div>
                  <h2 className="text-lg font-semibold text-text">Request access</h2>
                  <p className="mt-2 text-sm leading-relaxed text-text-muted">
                    Your name and email are recorded so I know who asked. That&apos;s all this is:
                    an access log, not identity verification.
                  </p>
                  <div className="mt-6">
                    <Button type="button" onClick={() => setState("form")}>
                      <Lock size={16} /> Click to view
                    </Button>
                  </div>
                </div>
              ) : (
                <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
                  <div>
                    <h2 className="text-lg font-semibold text-text">Request access</h2>
                    <p className="mt-2 text-sm leading-relaxed text-text-muted">
                      Recorded as an access log. Not identity verification.
                    </p>
                  </div>

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
                      aria-describedby={fieldErrors.fullName ? nameErrorId : undefined}
                      className="mt-2 w-full rounded-xl border border-border-strong bg-bg-elevated px-4 py-3 text-sm text-text outline-none transition-colors focus:border-accent"
                    />
                    {fieldErrors.fullName ? (
                      <p id={nameErrorId} className="mt-2 text-sm text-red-400">
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
                      aria-describedby={fieldErrors.email ? emailErrorId : undefined}
                      className="mt-2 w-full rounded-xl border border-border-strong bg-bg-elevated px-4 py-3 text-sm text-text outline-none transition-colors focus:border-accent"
                    />
                    {fieldErrors.email ? (
                      <p id={emailErrorId} className="mt-2 text-sm text-red-400">
                        {fieldErrors.email}
                      </p>
                    ) : null}
                  </div>

                  <Button type="submit" disabled={state === "submitting"}>
                    {state === "submitting" ? "Requesting…" : "Request Access"}
                  </Button>

                  <div role="status" aria-live="polite" className="min-h-5 text-sm">
                    {error ? <p className="text-red-400">{error}</p> : null}
                  </div>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

/**
 * The locked state.
 *
 * Everything here is a placeholder shape. No line of the real CV is present in
 * the markup, so there is nothing to recover by unblurring, deleting a class or
 * reading the page source: the bytes simply are not in the response.
 */
function LockedPreview() {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border bg-bg-elevated p-8 shadow-[var(--shadow-card)]"
      aria-hidden="true"
    >
      <div className="pointer-events-none select-none blur-[5px]" aria-hidden="true">
        <div className="h-5 w-48 rounded bg-bg-elevated-2" />
        <div className="mt-3 h-3 w-64 rounded bg-bg-elevated-2" />
        <div className="mt-8 h-3 w-24 rounded bg-bg-elevated-2" />
        <div className="mt-4 flex flex-col gap-2.5">
          {[92, 86, 78, 88, 64].map((w) => (
            <div key={w} className="h-2.5 rounded bg-bg-elevated-2" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="mt-8 h-3 w-28 rounded bg-bg-elevated-2" />
        <div className="mt-4 grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-2.5 rounded bg-bg-elevated-2" />
          ))}
        </div>
        <div className="mt-8 flex flex-col gap-2.5">
          {[80, 70, 90].map((w) => (
            <div key={w} className="h-2.5 rounded bg-bg-elevated-2" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-bg/70 px-6 text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-border-strong bg-bg-elevated text-accent">
          <Lock size={18} />
        </span>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">Confidential CV</p>
        <p className="text-sm text-text-muted">Click to view</p>
      </div>
    </div>
  );
}

function Viewer({ headingRef }: { headingRef: React.RefObject<HTMLHeadingElement | null> }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-bg-elevated shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="inline-flex items-center gap-2 text-sm font-semibold text-text outline-none"
        >
          <ShieldCheck size={16} className="text-accent" /> Access granted
        </h2>
        <span className="font-mono text-xs uppercase tracking-wide text-text-faint">
          Current version
        </span>
      </div>

      {/*
        The viewer points at the same protected route as the download. It is not
        a second, weaker path to the file: an unauthorised request for this src
        gets the same 401 the download would.
      */}
      <object
        data="/api/cv/document?disposition=inline"
        type="application/pdf"
        className="h-[36rem] w-full bg-bg-elevated-2"
        aria-label={`Curriculum vitae of ${site.name}`}
      >
        <div className="flex flex-col items-start gap-4 p-8">
          <p className="text-sm text-text-muted">
            Your browser can&apos;t display the PDF inline. Open it in a new tab or download it
            instead.
          </p>
          <ButtonLink href="/api/cv/document?disposition=inline" variant="secondary" external>
            <FileText size={16} /> Open CV
          </ButtonLink>
        </div>
      </object>
    </div>
  );
}

function GrantedPanel() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-text">Your copy</h2>
      <p className="mt-2 text-sm leading-relaxed text-text-muted">
        The CV includes contact details that aren&apos;t published on the site. Please keep it to
        the people who need it.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        {/*
          A plain link rather than a fetch-and-blob: the browser handles the
          download, and the request carries the grant cookie automatically.
        */}
        <ButtonLink href="/api/cv/document?disposition=attachment" variant="primary" external>
          <Download size={16} /> Download CV
        </ButtonLink>
        <ButtonLink href="/api/cv/document?disposition=inline" variant="secondary" external>
          <FileText size={16} /> Open in new tab
        </ButtonLink>
      </div>
      <p className="mt-6 text-xs leading-relaxed text-text-faint">
        Access lasts for this browser session. Something wrong with the document?{" "}
        <a href={site.emailHref} className="text-accent-strong hover:text-accent">
          Email me
        </a>
        .
      </p>
    </div>
  );
}
