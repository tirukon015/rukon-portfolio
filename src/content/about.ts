export const about = {
  profileTitle: "Web Developer & IT Operations Lead",
  profileTags: [
    "Web Development",
    "IT Operations",
    "Operations Systems",
    "AI / LLM Engineering",
  ],
  paragraphs: [
    "I'm a web developer and IT operations lead based in Cyberjaya, Malaysia. The work runs across two sides that usually sit apart: building the websites and internal systems, and running the operations they support day to day.",
    "The largest of those is RPOMS, a production-operations platform I designed and built for a router-refurbishment programme run by Blue Bee Technologies, and still maintain. As IT Systems & Operations Lead for it I own both halves: the software, interfaces, data model, access control and the deployment path to production, and the physical process it supports, the stock it tracks, and the people running it. Around 35,800 lines of TypeScript across ten admin modules and twenty-five API routes.",
    "For ERTH, a Malaysian e-waste collection service, I prototyped the interface in Figma and then built the production homepage from the approved design: static HTML, CSS and vanilla JavaScript bundled by Vite, with the technical SEO, structured data, performance and accessibility work in the same pass. That website is complete and deployed.",
    "Alongside that I built ResearchForge, an AI research assistant that reads an academic PDF and produces a structured summary, a gap analysis where every gap carries the evidence behind it, and a literature review. It runs a Python and FastAPI backend beside a Next.js frontend on its own domain, with accounts and a private per-user library, and it's built to say when the paper doesn't support an answer rather than produce a plausible one.",
    "My own stack is still moving. TypeScript is what I write production systems in daily, and I'm deliberately deepening it alongside newer platform work rather than treating it as finished. I'm currently completing a B.Sc. in Information Technology at the University of Cyberjaya, and looking for web development and IT operations roles, internship or full-time, where I can keep building systems that hold up under real, daily use.",
  ],
  facts: [
    { label: "Location", value: "Cyberjaya, Selangor, Malaysia" },
    { label: "Degree", value: "B.Sc. Information Technology (in progress)" },
    { label: "Status", value: "Open to opportunities" },
    { label: "Languages", value: "English, Bengali, Hindi, Urdu" },
  ],
} as const;
