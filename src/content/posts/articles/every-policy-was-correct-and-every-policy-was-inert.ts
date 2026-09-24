import type { BlogPost } from "../types";

export const post: BlogPost = {
    slug: "every-policy-was-correct-and-every-policy-was-inert",
    title: "Every Policy Was Correct, and Every Policy Was Inert",
    description:
      "A data-isolation defect that passed the entire test suite, shipped, and behaved perfectly. What it took to find it, and why the fix was to stop asking the application to be careful.",
    date: "2026-09-06",
    category: "Full-Stack Development",
    tags: ["PostgreSQL", "Row Level Security", "Security", "Testing", "Supabase"],
    contentType: "Experience-led",
    searchIntent: "problem-aware",
    relatedProjects: ["researchforge"],
    relatedPosts: [
      "making-an-llm-admit-the-paper-does-not-say",
      "why-system-maintenance-matters-after-deployment",
    ],
    sections: [
      {
        heading: "The setup",
        body: [
          "ResearchForge is a university project I built for BIT4543 Artificial Intelligence: upload an academic paper, get a structured analysis, and keep it in a research library. Once there is a library, there are accounts, and once there are accounts, one user's papers must not be visible to another. That is the whole security requirement, and it sounds like the easy part.",
          "The database is PostgreSQL, chosen specifically for Row Level Security. Policies were written for every table. Each one said, correctly, that a row belongs to the account that owns it. I reviewed them. They were right.",
        ],
      },
      {
        heading: "Everything passed",
        body: [
          "The application worked. Sign-up worked, sign-in worked, the library listed the right papers, the analysis pipeline stored results against the right owner. The automated suite passed, including the tests written specifically for ownership.",
          "So the feature shipped. There was no failing test to notice, no error in the logs, no user complaint, and no symptom of any kind. Every observable signal said the isolation guarantee was working.",
          "It was not working. Not partially, not intermittently. Not at all.",
        ],
      },
      {
        heading: "What was actually wrong",
        body: [
          "The backend was connecting to the database with a privileged key. That class of key exists precisely to bypass Row Level Security, because migrations and administrative jobs need to see everything.",
          "So every policy was present, every policy was correctly written, and every policy was inert. The database was being asked the question by a caller entitled to ignore the answer. The rules were fine; nothing was consulting them.",
          "This is worth dwelling on because it is not a bug in any line of code. There is no wrong condition to spot in a review. Both halves are individually reasonable: a correct policy, and a working database connection. The defect only exists in the relationship between them, which is the hardest kind to see.",
        ],
      },
      {
        heading: "Why no test caught it",
        body: [
          "The ownership tests were real tests, and they passed for a real reason: they verified that the application carries each caller's identity faithfully through the stack. It does. That was never the broken part.",
          "But they modelled Row Level Security with a stub. A stub is an assertion that the database behaves as you believe it does, expressed in code that cannot be wrong about it. When the belief is the thing that is wrong, the stub agrees with you, confidently, every single run.",
          "That is the general lesson I took from this. A test can only fail in the space it is looking at. If the guarantee lives in a system your tests replace with a fake, your tests have no opinion about the guarantee at all, no matter how many of them there are.",
        ],
      },
      {
        heading: "How it was found",
        body: [
          "By signing in as a second real account and looking at whether the first account's papers were visible.",
          "That is the entire technique. No tooling, no audit, no clever query. Two accounts, one deployed system, one question asked from the outside. It took a couple of minutes and it found something that hundreds of automated tests had been unable to see.",
        ],
      },
      {
        heading: "The fix",
        body: [
          "The fix was not to add ownership filters to the queries. It was to change which credential the backend uses to reach the database: requests are now made as the signed-in user, so PostgreSQL resolves the authenticated identity itself and applies every policy automatically.",
          "The property that produces is the one worth having. A forgotten ownership filter now returns nothing rather than everything. That is the opposite of how that mistake normally fails, and it is the difference between a guarantee and a habit.",
          "Ownership columns also default to the authenticated identity, so a row cannot be inserted without an owner even if the application code forgets to set one. Isolation stopped being something every query has to remember and became a property of the data layer.",
        ],
      },
      {
        heading: "What I do differently now",
        body: [
          "Ask which component actually enforces a guarantee, then verify that component rather than the code around it. If the answer is 'the database', a test that stubs the database is not verification.",
          "Keep testing levels separate and expect each to catch what the others cannot. Unit tests proved the application carried identity correctly. Only a live scenario, run as two different people against the deployed system, could prove the database was applying its own rules.",
          "Treat privileged credentials as a deliberate exception rather than a default. The convenient key is convenient because it skips the mechanism you installed on purpose.",
          "And be suspicious of a security feature that has never once refused you anything. A policy that has not blocked something is a policy you have not tested; it is only a hypothesis with good syntax.",
        ],
      },
    ],
    related: [{ label: "ResearchForge case study", href: "/work/researchforge" }],
  };
