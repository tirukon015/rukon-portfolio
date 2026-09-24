import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "building-software-in-cyberjaya-the-development-environment",
  title: "Building Software in Cyberjaya: The Development Environment Behind the Work",
  description:
    "What a production operations system, a client website, an AI research assistant and a vision inspector actually get built on, from a laptop in Cyberjaya: the machine, the stack, where things are hosted, and the local details that shaped the code.",
  date: "2026-09-24",
  category: "Malaysia & Cyberjaya",
  location: "Cyberjaya, Malaysia",
  tags: ["Cyberjaya", "Malaysia", "Developer Workflow", "Next.js", "Vercel", "Supabase", "Ollama"],
  contentType: "Local/Malaysia",
  searchIntent: "informational",
  relatedProjects: ["rpoms", "erth", "researchforge"],
  relatedPosts: [
    "the-business-day-is-not-the-server-day",
    "a-vision-model-that-only-observes",
    "cutting-a-page-image-payload-from-12mb-to-under-3mb",
  ],
  sections: [
    {
      heading: "Where this is written from",
      body: [
        "I work from Cyberjaya, in Selangor, a short drive from Kuala Lumpur. I am completing a B.Sc. in Information Technology at the University of Cyberjaya and I work at Blue Bee Technologies, also in Cyberjaya, where I lead the systems side of a router-refurbishment programme. The projects on this site were built here: [RPOMS](/work/rpoms), the operations system that programme runs on; the production homepage for [ERTH](/work/erth), a Malaysian e-waste service with a 24-hour drop-off point in Cyberjaya; [ResearchForge](/work/researchforge), a university AI project; and the RPOMS AI inspector.",
        "People sometimes ask what that takes in practice, so this is the environment as it actually is, with the numbers read off the machine rather than remembered. Nothing here is exotic. That is partly the point.",
      ],
    },
    {
      heading: "The machine",
      body: [
        {
          type: "table",
          head: ["Component", "What it is"],
          rows: [
            ["Laptop", "Windows 11 Pro"],
            ["CPU", "11th-generation Intel Core i5-1145G7, 4 cores, 8 threads"],
            ["Memory", "32 GB"],
            ["Graphics", "Intel Iris Xe, integrated; no discrete GPU"],
            ["Storage", "512 GB NVMe"],
            ["Runtime", "Node.js 24, npm 12, Git 2.55"],
            ["Editor and shell", "VS Code, Git Bash, with WSL available"],
          ],
          caption: "Read from the machine on 24 September 2026.",
        },
        "An Apple M4 MacBook is used for Xcode, because one of the side projects is a native iOS app, and it was where the first local vision-model runs happened. Everything on this site's stack builds and runs on the Windows laptop alone.",
        "The 32 GB matters more than the CPU. A Next.js dev server, a browser with the site in it, a local Postgres, and, for one project, a 7 GB vision model held in memory at the same time, is a normal afternoon.",
      ],
    },
    {
      heading: "The stack, by project",
      body: [
        {
          type: "list",
          items: [
            "This portfolio: Next.js 16 with the App Router, React 19, TypeScript strict, Tailwind CSS v4. Five runtime dependencies. Content is typed data in the repository, no CMS.",
            "RPOMS: Next.js 15, TypeScript, Tailwind v4, PostgreSQL on Supabase in production, MySQL on cPanel as the alternative deployment, and a JSON file store for laptops and demos. Vitest for the tests.",
            "RPOMS AI: Next.js 16, PostgreSQL with PGlite as a local database for development, Ollama for the model. Zod for every schema the model output crosses.",
            "ERTH's homepage: static HTML, CSS and vanilla JavaScript bundled by Vite 7, with a post-build verification script.",
            "ResearchForge: Python 3.12 and FastAPI behind a Next.js 16 frontend, both services in one Vercel project behind one origin; Supabase Auth and Postgres with Row Level Security; pytest and Vitest.",
            "The RPOMS print engine: Vite, React and framework-free TypeScript driving a Bluetooth label printer from Chrome, with 116 tests that run against a simulated printer.",
          ],
        },
        "The pattern across all of them: TypeScript on the front, either Next.js route handlers or FastAPI behind it, Postgres underneath, deployed to Vercel, with the one exception of a static site that needed nothing more than a static host.",
      ],
    },
    {
      heading: "Working without a database, on purpose",
      body: [
        "Two of the systems can run with no database configured at all. RPOMS falls back to a folder of JSON files; RPOMS AI runs PGlite, an embedded Postgres, on a local port. Both decisions came from the same place: a laptop on a train, a demo in a meeting room with bad Wi-Fi, a first afternoon for someone new who should not need credentials to see the system work. Picking the backend from which environment variables exist means the same build runs in all three places, and the [storage article](/blog/one-storage-interface-three-backends) covers what that cost.",
      ],
    },
    {
      heading: "Running a vision model on integrated graphics",
      body: [
        "The most demanding thing this laptop does is host a 7-billion-parameter vision model for RPOMS AI, because the project's rule is that the mandatory AI cost is zero. Ollama ignores integrated GPUs by default, which put the whole model on the CPU at 119 seconds per photo. One environment variable enables the Iris Xe through Vulkan, and a new photo drops to a median of 41 seconds, with the GPU busy 96 percent of the time and the process holding about 7 GB of memory. Of those 41 seconds, roughly 28 are encoding the image, which is why the pipeline caps what the model is shown at 896 px on the long edge.",
        "That is slow, and it is measured honestly rather than quoted from the best run. It is also enough to develop and evaluate against, which is what a development machine is for. The intended permanent host is a dedicated server, and the documentation is explicit that migrating changes availability and not accuracy. The [RPOMS AI article](/blog/a-vision-model-that-only-observes) has the evaluation.",
      ],
    },
    {
      heading: "Hosting, and the deployment path",
      body: [
        "Vercel hosts the portfolio, ResearchForge, RPOMS and RPOMS AI. Production and preview deployments get separate secrets, and RPOMS refuses to let a preview open the production database at all. Supabase provides Postgres and, for ResearchForge, authentication. cPanel with MySQL remains a supported RPOMS deployment for the case where a business already pays for shared hosting and wants the system on its own subdomain. The deployment steps for both are plain text files in the repository, written so that someone who is not me can follow them.",
        "One thing the Vercel path taught, twice: changing an environment variable does not affect a deployment that already exists. Edit, then redeploy, or the old values stay live.",
      ],
    },
    {
      heading: "The local details that ended up in the code",
      body: [
        "Building for Malaysian users and a Malaysian operation left fingerprints on the code that a tutorial would never mention.",
        {
          type: "list",
          items: [
            "Time. Servers keep UTC and the warehouse keeps UTC+8, so [the business day is resolved in Asia/Kuala_Lumpur](/blog/the-business-day-is-not-the-server-day) rather than read off the server clock.",
            "Dates. The office writes them day first, 24/07/2026, so the [CSV import](/blog/staged-csv-import-for-operational-data) reads them that way and uses the unambiguous values to check the convention.",
            "Bandwidth. ERTH's homepage started at 12 MB of images, which is a real cost on mobile data. [It shipped at 2.7 MB](/blog/cutting-a-page-image-payload-from-12mb-to-under-3mb), self-hosted, with no third-party requests.",
            "Language. RPOMS publishes its dashboard in English and Arabic with right-to-left rendering, and its translations are typed against English so a missing string fails the build.",
            "Money. A personal iOS expense tracker I am building parses Malaysian receipt and e-wallet formats, RM 25.90 and MYR 25.90 and the rest, entirely on the device, because that is what local receipts look like.",
          ],
        },
      ],
    },
    {
      heading: "What is not here",
      body: [
        "No cloud development environment, no GPU rental, no monorepo tooling, no infrastructure beyond what a hosting platform provides. I have not needed them. The interesting problems on every one of these projects were in the domain, the data and the honesty of the system, not in the toolchain, and a mid-range laptop with enough memory has been sufficient to work on all of them from Cyberjaya.",
        "If you are a student or an early-career developer in the Klang Valley wondering what you need to build something real: less than you think, and more memory than you think.",
      ],
    },
  ],
  related: [
    { label: "RPOMS case study", href: "/work/rpoms" },
    { label: "ERTH case study", href: "/work/erth" },
    { label: "ResearchForge case study", href: "/work/researchforge" },
  ],
};
