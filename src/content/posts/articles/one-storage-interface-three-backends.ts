import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "one-storage-interface-three-backends",
  title: "One Storage Interface, Three Backends: How RPOMS Picks Its Database",
  description:
    "PostgreSQL on Vercel, MySQL on cPanel, or a folder of JSON files on a laptop, chosen by which environment variables exist. What that bought, what it cost, and the production lessons about pooled connections and reads that never came back.",
  date: "2026-09-24",
  category: "Building Real Systems",
  tags: ["PostgreSQL", "MySQL", "Supabase", "Next.js", "Architecture", "Vercel"],
  contentType: "Technical Guide",
  searchIntent: "problem-aware",
  relatedProjects: ["rpoms"],
  relatedPosts: [
    "staged-csv-import-for-operational-data",
    "the-business-day-is-not-the-server-day",
    "every-policy-was-correct-and-every-policy-was-inert",
  ],
  sections: [
    {
      heading: "Why three",
      body: [
        "RPOMS, the operations system I built for a router-refurbishment line, had to run in three quite different places during its life. On a laptop with no database at all, so the whole system could be worked on and demonstrated offline. On shared cPanel hosting with MySQL, which is where a lot of small Malaysian businesses already pay for hosting. And on Vercel with PostgreSQL on Supabase, which is where production ended up.",
        "Rather than pick one and make the others painful, the storage layer is one interface with three implementations, and the choice is made at startup by which environment variables are present: a Postgres connection string selects Postgres, the MySQL host, name and user variables select MySQL, and nothing selects the local file store. Nothing in the interface, the API routes or the UI changes between them.",
        {
          type: "table",
          head: ["Backend", "Chosen when", "Where it runs"],
          rows: [
            ["PostgreSQL (Supabase)", "`DATABASE_URL` is set", "Vercel, production"],
            ["MySQL", "`DB_HOST`, `DB_NAME`, `DB_USER` are set", "cPanel shared hosting"],
            ["Local file store", "neither is set", "development, offline demos"],
          ],
        },
      ],
    },
    {
      heading: "Tables on demand, and the cost of that convenience",
      body: [
        "Each store creates its tables and indexes on first use, so a fresh deployment needs no migration step. For a system that had to be stood up on a cPanel account by someone following a text file, that was the right call.",
        "It has a cost I did not appreciate at first: any deployment that runs the code alters the database it is pointed at the first time it takes a request, previews included. A branch that changes a store's schema stamp changes the database. The eventual answer was not to remove on-demand creation but to make sure a preview can never be pointed at production, which is the next section.",
      ],
    },
    {
      heading: "A preview deployment that refuses the production database",
      body: [
        "Before the first connection, an environment guard asks one question: is this kind of deployment allowed to open this database? A preview or development deployment whose connection string names the production project throws instead of connecting. A production deployment on a database labelled staging throws too. A laptop pointed at production throws. Each case has a single named override for the one legitimate use, set as a scoped variable rather than a default.",
        "The reference beats the label: a connection string that names the production project is production whatever a human-written environment label says, so a mistyped label cannot unlock production for a preview. And when the guard refuses, the middleware answers every request with a 503 and the reason, never a secret, rather than serving a page that quietly renders with defaults and looks merely empty. That last part was learned by running a production build as a fake preview and watching it look fine while the log said it had refused to connect.",
        "The file store has its own refusal. On Vercel, a deployment with no database variable used to accept every save into a disk that vanishes at the next cold start. It now fails loudly, unless a variable says a throwaway demo is meant.",
      ],
    },
    {
      heading: "What the transaction pooler changes",
      body: [
        "Production connects through Supabase's transaction-mode pooler on port 6543. Transaction pooling means a connection is handed to a client for one transaction at a time, which is what makes it safe to open from a serverless function, and it also means prepared statements are unsupported, because the next statement may run on a different underlying connection. So the Postgres client is created with prepared statements off. That is one line, and it is the one line that fails in a confusing way if it is missing.",
        "The pool size was five for a long time, and pages that asked seven questions at once meant two of them always queued. Harmless while everything is quick; ruinous when one read stalls, because everything behind it stalls too. Supabase reported sixty connections available and seven in use, so the headroom was always there. It is ten now.",
        "Connections are retired after a minute however healthy they look. On Vercel's Fluid Compute an instance can be frozen between requests, and the pooler drops connections it considers idle, but the client is told about neither. It keeps sockets it believes are open and are not, and a query sent down one of those waits for an answer that never comes.",
      ],
    },
    {
      heading: "Every read has a deadline",
      body: [
        "Nothing originally had one. A query that blocked, on a lock or on one of those dead sockets, blocked for as long as the request lived, and the page sat on its loading skeleton and never finished. Measured against the live site, the same page returned in 1.2 seconds on one attempt and was still hanging ninety seconds later on the next two.",
        "Now every read runs under an eight-second deadline and falls back to what the caller would have shown had the read failed. The database answers in single-digit milliseconds when it is healthy, so the deadline is not a limit any normal read reaches; it exists so a stuck one gives up and lets the page render without it.",
        {
          type: "callout",
          label: "Where a fallback would lie",
          text: "A timed-out read of a daily report that returns null says \"there is no report for that day\", and a caller that believes it will offer a blank form for a day that already exists. So reads where absence and failure must not look alike get a distinct sentinel value instead, and decide for themselves what an unanswered read means.",
        },
      ],
    },
    {
      heading: "The file store is not a toy",
      body: [
        "It is tempting to treat the JSON-files backend as a development convenience and leave it fragile. It is the backend every demo runs on, so it got the same care. Writes are atomic: the file is written to a temporary path and then renamed, so a process stopped mid-write cannot leave a half-written file that reads as empty. Stock is derived from the full history of adjustments and consumption on every backend, never stored as a running total, so a figure that looks wrong can be walked back to the day that produced it.",
      ],
    },
    {
      heading: "What I would tell someone doing the same",
      body: [
        {
          type: "list",
          items: [
            "Pick the backend from the environment, not from a config flag, so a deployment cannot be half-configured into the wrong one.",
            "If tables are created on demand, decide up front which deployments are allowed to touch which database, and enforce it in code before the first connection.",
            "Read the pooler documentation before the client documentation. The pooling mode decides which client features exist.",
            "Give every read a deadline and a fallback, and give the reads where absence is meaningful a way to say \"I do not know\".",
          ],
        },
        "The system this comes from is described in the [RPOMS case study](/work/rpoms), including which modules are live and which are held behind a write lock pending sign-off.",
      ],
    },
  ],
  related: [{ label: "RPOMS case study", href: "/work/rpoms" }],
};
