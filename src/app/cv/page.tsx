import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CVAccess } from "@/components/sections/cv-access";
import { openGraphFor, twitterFor } from "@/lib/seo";

const title = "CV";
/**
 * Deliberately says nothing the CV contains. No contact details, no address,
 * no employment detail: metadata is public by definition, and duplicating
 * protected content into it would undo the gate on the page below.
 */
const description =
  "Request access to my full CV. The document is available on request rather than published, because it carries contact details that aren't public on this site.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/cv" },
  openGraph: openGraphFor({ title, description, url: "/cv" }),
  twitter: twitterFor(title, description),
  // The page is fine to index; the document behind it is not, and the
  // document route sets its own noindex header.
  robots: { index: true, follow: true },
};

const crumbs = [
  { name: "Home", href: "/" },
  { name: "CV", href: "/cv" },
];

const SOURCES = new Set(["hero", "about", "contact"]);

export default async function CVPage({ searchParams }: PageProps<"/cv">) {
  const { from } = await searchParams;
  const source = typeof from === "string" && SOURCES.has(from) ? from : "direct";

  return (
    <>
      <div className="border-b border-border pt-16">
        <Container>
          <Breadcrumbs items={crumbs} />
        </Container>
      </div>
      <CVAccess source={source} />
    </>
  );
}
