import { Hero } from "@/components/sections/hero";
import { SelectedWork } from "@/components/sections/selected-work";
import { Capabilities } from "@/components/sections/capabilities";
import { Experience } from "@/components/sections/experience";
import { Stack } from "@/components/sections/stack";
import { About } from "@/components/sections/about";
import { Process } from "@/components/sections/process";
import { Education } from "@/components/sections/education";
import { Faq } from "@/components/sections/faq";
import { LatestWriting } from "@/components/sections/latest-writing";
import { Contact } from "@/components/sections/contact";
import { JsonLd } from "@/components/seo/json-ld";
import { faqs } from "@/content/faq";
import { site } from "@/content/site";
import { absoluteUrl, graph, PERSON_ID, WEBSITE_ID } from "@/lib/seo";

/**
 * The homepage carries a ProfilePage node (this page is about a person) and an
 * FAQPage node built from the same array the FAQ section renders, so the markup
 * and the visible answers cannot drift apart.
 *
 * Person and WebSite are declared once in the root layout and referenced here
 * by @id rather than repeated.
 */
const homeSchema = graph(
  {
    "@type": "ProfilePage",
    "@id": absoluteUrl("/"),
    url: absoluteUrl("/"),
    name: `${site.name}: ${site.role}`,
    description: site.statement,
    inLanguage: "en-MY",
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: { "@id": PERSON_ID },
  },
  {
    "@type": "FAQPage",
    "@id": `${absoluteUrl("/")}#faq`,
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  }
);

export default function Home() {
  return (
    <>
      <JsonLd data={homeSchema} />
      <Hero />
      <SelectedWork />
      <Capabilities />
      <Experience />
      <Stack />
      <About />
      <Process />
      <Education />
      <Faq />
      <LatestWriting />
      <Contact />
    </>
  );
}
