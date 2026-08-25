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

export default function Home() {
  return (
    <>
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
