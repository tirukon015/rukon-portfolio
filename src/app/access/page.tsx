import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { AccessRequestForm } from "@/components/access/access-request-form";

export const metadata: Metadata = {
  title: "Request Portfolio Access | Touhidul Islam Rukon",
  description:
    "Request authorized access to view confidential client identities, original project names, and unredacted case study data.",
  alternates: { canonical: "/access" },
};

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Request Access", href: "/access" },
];

export default function AccessPage() {
  return (
    <div className="pt-6 pb-20 sm:pb-24 lg:pb-32">
      <Container className="max-w-3xl">
        <Breadcrumbs items={crumbs} />

        <div className="mt-8">
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
            Confidentiality Gate
          </span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            Request Authorized Portfolio Access
          </h1>
          <p className="mt-4 text-base leading-relaxed text-text-muted">
            Certain client identities, product names, and production screenshots on this portfolio are
            anonymized under non-disclosure commitments. Technical recruiters, prospective employers,
            and engineering collaborators can request access to review original, unredacted records.
          </p>
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-bg-elevated p-8 sm:p-10 shadow-[var(--shadow-card)]">
          <AccessRequestForm />
        </div>
      </Container>
    </div>
  );
}
