import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "contributing-fixes-to-a-web-app-you-did-not-build",
  title: "Maintaining a Web System I Didn't Build: Small, Scoped Fixes",
  description:
    "Three small fixes to a Next.js inventory app another developer built: a lazily loaded Excel library, a duplicate fetch on first load, and a reset-password redirect, kept reviewable.",
  date: "2026-10-02",
  category: "Developer Journey",
  tags: ["Next.js", "React", "Maintenance", "Code Review", "Dynamic Import", "Supabase Auth"],
  contentType: "Experience-led",
  searchIntent: "problem-aware",
  seoTitle: "Maintaining a Next.js App You Didn't Build",
  relatedProjects: ["itms"],
  relatedPosts: [
    "adding-label-printing-to-a-nextjs-app-through-a-relay-page",
    "why-system-maintenance-matters-after-deployment",
    "mapping-an-excel-tracker-to-a-database-schema",
  ],
  sections: [
    {
      heading: "The situation: a system I support but did not write",
      body: [
        "BBTech's inventory system, [ITMS](/work/itms), is a Next.js, TypeScript and Supabase application built by another BBTech developer in 2026, while I was committed to other projects. Since it was released I troubleshoot problems, fix issues and make improvements, and I work with the developer whenever the application itself needs to change. Before that I worked on and maintained the Excel tracker it replaced, so I know the process well and the codebase less well.",
        "That combination shapes how I change it. This article walks through three small fixes from the same branch as my printing integration, which is described in [Adding Label Printing to an Existing Next.js App](/blog/adding-label-printing-to-a-nextjs-app-through-a-relay-page). It also covers the habits that keep changes like these easy for the system's developer to accept. None of the branch has been merged yet.",
      ],
    },
    {
      heading: "Fix 1: load the Excel library only when someone exports",
      body: [
        "Tables in ITMS share an export panel that can save the current rows as an .xlsx file. The panel imported SheetJS at the top of the module, so every page that rendered a table shipped the spreadsheet library, whether or not anyone ever clicked Export.",
        "The fix moves the import inside the click handler. A dynamic `import()` tells the bundler to split the library into its own chunk, fetched on first use:",
        {
          type: "code",
          lang: "ts",
          code: `-import * as XLSX from "xlsx";

-const exportExcel = () => {
+const exportExcel = async () => {
+  // Loaded on export only, so pages with a table don't ship the Excel library
+  const XLSX = await import("xlsx");
   const data = mode === "all" ? allData : filteredData;
   // ...unchanged: json_to_sheet, book_new, writeFile`,
          caption: "The diff, shortened. Nothing after the import changed.",
        },
        "The rest of the function is untouched, because the namespace object from a dynamic import has the same shape as the static one. I did not measure the size difference, so I don't quote one. The direction is certain, though: a large library that serves one button no longer loads with every table. The cost is a short delay on the first export, which is acceptable for an action people take a few times a day.",
      ],
    },
    {
      heading: "Fix 2: the device list was fetched twice on first load",
      body: [
        "Device lists come from a shared hook, `useDevices`. The hook fetched the list in its own `useEffect` on mount. Each page using it also called `fetchDevices` in its own mount effect: the dashboard, the device lists, the workflow view, the aged-devices page and the analytics page. So every first load sent the same request twice.",
        "There were two ways to fix it: remove the pages' calls, or remove the hook's. I removed the hook's. The pages pass different arguments (some a stage, some none) and some also refetch on demand, so the pages are where the decision about what to load belongs. Removing their calls would have meant changing five files to save one. The hook keeps a comment where the effect used to be, so the contract is written down: the initial load is triggered by each page.",
        "That comment matters more than it looks. The new rule is that a future page using the hook must fetch on mount itself, and the next person to read the hook, who may be the original developer, should not have to rediscover that.",
      ],
    },
    {
      heading: "Fix 3: signed-in users were bounced away from reset-password",
      body: [
        "The middleware sorts paths into public ones (login, register) and protected ones (dashboard, audit, devices). It sends a signed-in user who visits a public page to the dashboard, which is right for login and register. `/reset-password` was in the public list too, so a signed-in user could never reach it. A password-recovery flow commonly lands the user with a session already established, so the reset page is exactly where a signed-in user needs to be.",
        "The fix takes reset-password out of the public list and gives it its own branch that lets the request through. The explicit branch does nothing the fall-through would not, but it records that reset-password is deliberately neither public nor protected, which a later edit to either list might otherwise undo.",
      ],
    },
    {
      heading: "How I keep changes acceptable to the person who owns the code",
      body: [
        "None of these fixes is clever. What makes them easy to review is how they are packaged, and that is a habit I would recommend to anyone working in another developer's codebase:",
        {
          type: "list",
          items: [
            "One concern per commit, with a message that says what and why: \"remove duplicate initial device fetch\", with the reason in the body. Each one can be accepted, reverted or questioned on its own.",
            "Work on a branch and let the owner merge. I do not push changes to an application whose structure someone else is responsible for. The printing integration and these fixes are on a branch for exactly that reason.",
            "Change the minimum, in the existing style. The export fix keeps the function's structure. The hook fix deletes three lines and adds a comment. No unrelated reformatting rides along to bury the real change in a diff.",
            "Reuse what is there. When the printing work needed the last saved version of a device, the drawer's state hook was already keeping it for unsaved-change detection. Returning it was one line, where a parallel copy of state would have been a new source of bugs.",
            "Leave notes where the next reader will look: in the code (the hook comment) and in the commit message, not only in a chat.",
          ],
        },
        "This is a different kind of maintenance from the one in [Why System Maintenance Matters After Deployment](/blog/why-system-maintenance-matters-after-deployment), which is about a system I built myself. There, I can change the design when it is wrong. Here, the design belongs to someone else, and my job is to make it work better within the design, and to raise anything bigger with its developer instead of quietly rewriting it.",
      ],
    },
  ],
};
