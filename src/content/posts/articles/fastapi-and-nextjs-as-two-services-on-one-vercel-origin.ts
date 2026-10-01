import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "fastapi-and-nextjs-as-two-services-on-one-vercel-origin",
  title: "Running FastAPI and Next.js as Two Services Behind One Vercel Origin",
  description:
    "One Vercel project, a Next.js frontend and a FastAPI backend on the same origin. The routing, the CORS outage it fixed, the image optimizer that vanished, and the Python packaging details.",
  date: "2026-10-01",
  category: "Full-Stack Development",
  tags: ["Vercel", "FastAPI", "Next.js", "Python", "Deployment", "CORS"],
  contentType: "Technical Guide",
  searchIntent: "problem-aware",
  seoTitle: "FastAPI + Next.js on One Vercel Origin",
  relatedProjects: ["researchforge"],
  relatedPosts: [
    "whole-document-context-instead-of-rag-for-paper-analysis",
    "when-not-to-fall-back-to-another-ai-provider",
    "why-system-maintenance-matters-after-deployment",
  ],
  sections: [
    {
      heading: "The problem: a Python backend and a Next.js frontend, one deployment",
      body: [
        "[ResearchForge](/work/researchforge) is a university project I built for BIT4543 Artificial Intelligence at the University of Cyberjaya. A signed-in user uploads an academic PDF and gets back a summary, a research-gap analysis and a literature review. The analysis pipeline is Python and FastAPI; the interface is Next.js 16. This article is for anyone who wants that pairing on Vercel without running two projects, two domains and a CORS configuration that has to be right for every URL the app will ever be served from.",
        "The answer I ended up with is one Vercel project running two services behind one origin. Getting there took one outage, one missing logo and a packaging error, and each of those is worth knowing about before you start.",
      ],
    },
    {
      heading: "One vercel.json, two services, three rewrites",
      body: [
        "The whole arrangement is declared in the project configuration. The frontend service is rooted at `app/`, the backend at the repository root, with the FastAPI app as its entrypoint:",
        {
          type: "code",
          lang: "json",
          code: `{
  "services": {
    "frontend": { "root": "app/", "framework": "nextjs" },
    "backend": {
      "root": "./",
      "framework": "fastapi",
      "entrypoint": "src.main:app",
      "functions": {
        "src/main.py": {
          "maxDuration": 300,
          "excludeFiles": "{app/**,venv/**,.venv/**,tests/**,notebooks/**,data/**,models/**,results/**,docs/**,**/__pycache__/**,**/*.pyc}"
        }
      }
    }
  },
  "rewrites": [
    { "source": "/api/(.*)", "destination": { "service": "backend" } },
    { "source": "/health", "destination": { "service": "backend" } },
    { "source": "/(.*)", "destination": { "service": "frontend" } }
  ]
}`,
          caption: "vercel.json from the ResearchForge repository.",
        },
        "Order matters: the catch-all is last, so it only receives what the two backend rules did not claim. `maxDuration: 300` is there because one analysis makes three model calls and takes one to three minutes; without it the function hits the default ceiling long before the third call returns. `excludeFiles` keeps the frontend source, the virtual environment, tests, documentation and evaluation results out of the Python bundle, since the backend root is the whole repository.",
        "The two services never call each other. They share an origin, and the browser talks to both.",
      ],
    },
    {
      heading: "Why same-origin fixed the custom domain, and why it avoids CORS for previews",
      body: [
        "The first production build had `NEXT_PUBLIC_API_BASE_URL` set to the project's `.vercel.app` address, and Next.js inlines `NEXT_PUBLIC_` values into the bundle at build time. A page served from the custom domain therefore fetched `/health` from a different host. FastAPI's CORS allow-list did not name the custom domain, the browser blocked the response, and the interface said \"Backend offline\" on exactly the domain that mattered, while the `.vercel.app` URL kept working because it happened to be its own allowed origin.",
        "Pinning the API to one absolute host was the bug. It turns every other host, the custom domain and every preview URL, into a cross-origin caller that needs its own CORS entry. Because the rewrites already make `/api/*` answer on whatever host served the page, the fix was to stop naming a host at all:",
        {
          type: "code",
          lang: "ts",
          code: `const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

export const API_BASE_URL =
  configuredBaseUrl !== undefined && configuredBaseUrl !== ""
    ? configuredBaseUrl.replace(/\\/+$/, "")
    : process.env.NODE_ENV === "development"
      ? "http://localhost:8000"
      : "";`,
          caption: "An empty base URL in a production build makes every call a relative, same-origin path.",
        },
        "Local development is the one genuinely two-origin case, Next.js on port 3000 and uvicorn on 8000, so it is selected by `NODE_ENV` rather than by a variable someone has to remember. In production the variable was removed. A same-origin request is not subject to CORS at all, so the custom domain, the `.vercel.app` domain and every preview deployment work from one build with nothing to add per environment. The CORS allow-list still exists, as an explicit list and never `*`, and still names the custom domain; it simply stopped being on the critical path.",
      ],
    },
    {
      heading: "The image optimizer that was not there",
      body: [
        "The next production-only defect was a missing logo. Every Next.js `<Image>` pointed at `/_next/image`, and under this two-service routing that request was answered by the application's own catch-all rather than by the platform's optimizer, so the browser received a 404 HTML page where an image should have been. `next start` locally served the optimizer normally, which is why it only appeared once deployed. The raw asset had returned 200 all along.",
        "The fix was `images: { unoptimized: true }` in `next.config.mjs`, so `<Image>` emits the plain static path. `width` and `height` still reserve the box, so nothing shifts on load. The consequence is that the source file ships as it is, so the artwork had to be resized by hand: the header mark went from 1420 by 1108 pixels and 629 KB to 192 by 150 and 22 KB.",
      ],
    },
    {
      heading: "Python packaging, environment variables and deploys",
      body: [
        "Three smaller things cost time and are worth writing down:",
        {
          type: "table",
          head: ["Symptom", "Cause", "Fix"],
          rows: [
            ["Build fails with \"No `project` table found\"", "Vercel's Python builder runs `uv`, which prefers `pyproject.toml` over `requirements.txt` when both exist", "Give `pyproject.toml` a `[project]` table with runtime dependencies, and `[tool.uv] package = false`, since this is an application, not a library"],
            ["A new environment variable has no effect", "Backend values are read at cold start; `NEXT_PUBLIC_` values are compiled in at build", "Redeploy after every change"],
            ["Production shows old code after a push", "The Vercel project has no Git integration, so a push builds nothing", "Deploy with `vercel deploy --prod` from a working copy"],
          ],
          caption: "From the deployment notes in the ResearchForge repository.",
        },
        "The last one is a project choice rather than a platform limit, but it caught me twice before it was written at the top of the deployment document. If production looks stale after a push, check whether anything was ever going to build it.",
      ],
    },
    {
      heading: "What this layout gives you",
      body: [
        "One build serves every domain the project has. The frontend never needs to know where the backend lives. There is one set of environment variables and one deployment to roll back. The trade-offs are that the Python function carries the same 300-second ceiling for every route, that Next.js features which expect the platform to own `/_next/*` need checking, and that the backend's bundle rules have to exclude the frontend explicitly.",
        "The rest of the system, including how the analysis fits inside that 300 seconds, is in the [ResearchForge case study](/work/researchforge/case-study). The provider layer that runs inside the backend is described in [When Not to Fall Back to Another AI Provider](/blog/when-not-to-fall-back-to-another-ai-provider).",
      ],
    },
  ],
  related: [{ label: "ResearchForge case study", href: "/work/researchforge/case-study" }],
};
