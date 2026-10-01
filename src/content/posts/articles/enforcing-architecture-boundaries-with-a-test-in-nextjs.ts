import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "enforcing-architecture-boundaries-with-a-test-in-nextjs",
  title: "Enforcing Architecture Boundaries in a Next.js App With One Test File",
  description:
    "A Vitest file that reads the source tree and fails when a client component imports server code, an admin route skips its auth guard, or a minifier hazard creeps back in.",
  date: "2026-12-23",
  category: "Full-Stack Development",
  tags: ["Next.js", "Vitest", "Architecture Tests", "TypeScript", "Security", "Testing"],
  contentType: "Technical Guide",
  searchIntent: "problem-aware",
  seoTitle: "Enforce Import Boundaries in Next.js With a Test",
  relatedProjects: ["rpoms-ai"],
  relatedPosts: [
    "testing-every-nextjs-api-route-refuses-without-session",
    "hardening-a-public-photo-upload-exif-magic-bytes-and-re-encoding",
    "storing-uploaded-photos-in-postgres-bytea-admin-only",
  ],
  sections: [
    {
      heading: "Rules that are invisible when broken",
      body: [
        "This is for anyone with architectural rules that live only in a README or in reviewers' heads. Some rules fail loudly when broken. A type error stops the build. Others fail silently. A client component that imports a database module may still build and work while shipping code it should not. An admin route that forgets its auth check works perfectly for an admin, and for everyone else.",
        "When I first added this test to [RPOMS AI](/work/rpoms-ai), the commit message said it directly: a convention nobody checks is violated within a month. The file is `src/lib/boundaries.test.ts`. It uses no ESLint plugin and no dependency-graph tool. It walks `src`, reads each `.ts` and `.tsx` file as text, extracts import specifiers with a regex, and asserts.",
        {
          type: "code",
          lang: "ts",
          code: `const imports = (s: string) =>
  [...s.matchAll(/(?:from\\s+|import\\s*\\(\\s*)["']([^"']+)["']/g)].map((m) => m[1]);`,
          caption: "Static and dynamic imports, extracted as plain strings.",
        },
      ],
    },
    {
      heading: "The public page stays separate",
      body: [
        "The public checker is three files: the page, the checker component and the root layout. The test finds exactly those three, failing if the count changes, so a rename cannot quietly skip the check. It then asserts that none of them imports anything under `@/lib/` or any admin path. The public page cannot reach the database, auth or admin system even by accident, and it stays small.",
      ],
    },
    {
      heading: "Client components never touch server code or secrets",
      body: [
        "Client components are found by their first line, the `\"use client\"` directive. There must be at least six, which is a guard against the detection silently matching nothing. Two rules apply to them. None may import from a list of server-only modules: the database layer, environment access, the API helpers, audit logging, current-user resolution, admin bootstrap, the active-model resolver and the inference pipeline. And none may contain `process.env` at all.",
        "The second rule is stricter than it needs to be on purpose. Next.js only inlines `NEXT_PUBLIC_` variables into client bundles, so other reads would just be undefined. But a client component reading environment variables is a sign someone is about to move a secret to the wrong side. Failing early is cheaper than reviewing it later.",
      ],
    },
    {
      heading: "Every admin handler starts with the guard",
      body: [
        "The admin API lives under `src/app/api/admin/`. For every `route.ts` there, the test finds each exported `GET`, `POST`, `PUT`, `PATCH` or `DELETE` handler and checks that the first 400 characters of its body contain the exact guard line:",
        {
          type: "code",
          lang: "ts",
          code: `const g = await guard(request, "admin.access");
if (isGuarded(g)) return g.response;`,
          caption: "The pattern the test requires (any permission name is accepted).",
        },
        "It is a textual check, so it is strict about form. That is a feature: one way of writing the guard means one thing to look for in review. `guard()` also refuses cross-origin writes, and it answers 404 rather than 401 or 403 so the admin API does not advertise itself. The test also requires at least twelve admin routes to be found, again so a moved folder cannot turn it into a test of nothing. A [related article](/blog/testing-every-nextjs-api-route-refuses-without-session) shows the runtime version of the same idea: calling every route without a session.",
        "Admin pages get the same treatment. Every page under `src/app/admin/`, except the login page, must sit inside the `(panel)` route group, and that group's layout must call `await requireAdmin()`. A new admin page created one folder too high fails the suite.",
      ],
    },
    {
      heading: "The public response never leaks internals",
      body: [
        "The check endpoint builds its response in one object literal. The test slices the route source from that literal onward and asserts it does not mention `trace`, `modelId`, `photoId`, `evidence` or `clientHash`. It is crude. But it means adding the internal reasoning trace or the model's identity to the public response has to be a deliberate act that also edits a test. That fits the rest of the [upload hardening](/blog/hardening-a-public-photo-upload-exif-magic-bytes-and-re-encoding).",
      ],
    },
    {
      heading: "A compiler hazard pinned as a test",
      body: [
        "The last rule is the most specific, and it came from a production failure. With postgres.js you run queries as tagged templates on a client. Written as a tagged template on a parenthesised await, the code passed every test, which run through esbuild. The Next.js production minifier rewrote it as `await await db()` followed by the template, which tagged the Promise instead of the client, and production crashed.",
        "The fix was to bind the client to a variable first. The test makes sure the pattern never comes back: it fails on any parenthesised `await` call immediately followed by a template literal, anywhere in `src`. When a bug is a shape of code and not a single line, a source-scanning test is the cheapest permanent fix.",
      ],
    },
    {
      heading: "What this approach does not do",
      body: [
        "Text and regex checks can be fooled by unusual formatting, and they do not understand re-exports: a client component importing a harmless-looking module that itself imports the database would pass. They also only check what someone thought to write down. The original version of the file had a few more rules, including one against referencing the separate RPOMS system and one against ML libraries in the dependency tree. The current file focuses on the boundaries listed here. Within those limits it is fast, needs no tooling, and has run on every test pass. RPOMS AI is deployed, but no model is active in production and it has not been used on real line photos.",
      ],
    },
  ],
  related: [{ label: "RPOMS AI project", href: "/work/rpoms-ai" }],
};
