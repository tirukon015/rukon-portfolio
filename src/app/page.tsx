import { Suspense } from "react";
import { Hero } from "@/components/sections/hero";
import { FeaturedWork } from "@/components/sections/featured-work";
import { GithubActivity } from "@/components/sections/github-activity";
import { Capabilities } from "@/components/sections/capabilities";
import { Experience } from "@/components/sections/experience";
import { About } from "@/components/sections/about";
import { LatestWriting } from "@/components/sections/latest-writing";
import { Contact } from "@/components/sections/contact";
import { JsonLd } from "@/components/seo/json-ld";
import { site } from "@/content/site";
import { absoluteUrl, graph, PERSON_ID, WEBSITE_ID } from "@/lib/seo";

/**
 * The homepage carries a ProfilePage node (this page is about a person).
 *
 * Person and WebSite are declared once in the root layout and referenced here
 * by @id rather than repeated. The FAQPage node that used to sit here was
 * removed with the FAQ section: structured data has to mirror what a reader
 * can see, and the questions are no longer on this page.
 */
const homeSchema = graph({
  "@type": "ProfilePage",
  "@id": absoluteUrl("/"),
  url: absoluteUrl("/"),
  name: `${site.name}: ${site.role}`,
  description: site.statement,
  inLanguage: "en-MY",
  isPartOf: { "@id": WEBSITE_ID },
  mainEntity: { "@id": PERSON_ID },
});

export default function Home() {
  return (
    <>
      <JsonLd data={homeSchema} />
      <Hero />
      <FeaturedWork />
      {/*
        The calendar is fetched on the server and cached for an hour. The
        boundary keeps a slow or failed GitHub request from holding up the
        rest of the page; the fallback is deliberately empty.
      */}
      <Suspense fallback={null}>
        <GithubActivity />
      </Suspense>
      <Capabilities />
      <Experience />
      <About />
      <LatestWriting />
      <Contact />
    </>
  );
}
