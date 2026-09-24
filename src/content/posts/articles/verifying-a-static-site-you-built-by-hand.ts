import type { BlogPost } from "../types";

export const post: BlogPost = {
    slug: "verifying-a-static-site-you-built-by-hand",
    title: "Verifying a Static Site You Built by Hand",
    description:
      "Hand-written HTML has no type checker and no test runner. On a production build I wrote the guarantees instead, as a post-build script that fails the build.",
    date: "2026-08-31",
    category: "Full-Stack Development",
    tags: ["HTML", "Build Tooling", "Quality", "Accessibility", "SEO"],
    contentType: "Technical Guide",
    searchIntent: "problem-aware",
    relatedProjects: ["erth"],
    relatedPosts: [
      "rebuilding-a-design-prototype-as-a-production-website",
      "why-system-maintenance-matters-after-deployment",
    ],
    sections: [
      {
        heading: "The gap nobody mentions",
        body: [
          "Choosing static HTML, CSS and vanilla JavaScript for a single page is usually the right call. It is fast, it has no dependency surface worth attacking, and it will still build in five years.",
          "What you give up is not usually stated out loud: every safety net. There is no type checker to tell you a reference is wrong. No component test to catch a broken prop. No framework to notice that the thing you linked to does not exist. A typo in an href is just a string that happens to be wrong, and nothing in the toolchain has an opinion about it.",
          "On a page of a thousand lines of markup with dozens of internal anchors, that is not a theoretical risk. So on the ERTH homepage the guarantees got written by hand, as a script that runs as part of every build and fails it.",
        ],
      },
      {
        heading: "What it refuses to ship",
        body: [
          "A referenced asset that is not in the build output. The commonest failure in a static build is a path that was right in the source tree and wrong after bundling, and it produces a broken image rather than an error.",
          "An in-page link or an aria-controls attribute pointing at an id that does not exist. These two are the same class of bug and both are silent: the link does nothing, or the control announces a relationship to an element that is not there.",
          "A required head tag that is absent. Canonical, description, Open Graph, viewport. Easy to add, easy to lose in an edit, and invisible until something downstream is already wrong.",
          "JSON-LD that does not parse. Structured data is the one part of a page whose only consumer is a machine, which means a human will never notice it is broken. Parsing it at build time costs nothing and closes that gap completely.",
          "An image with no alt attribute or no intrinsic width and height. The first is an accessibility failure, the second is a layout shift, and both are things a busy edit drops.",
          "More or fewer than exactly one h1.",
        ],
      },
      {
        heading: "The check that mattered most",
        body: [
          "The last rule is the one I would keep if I could only keep one: the build fails if any prototype artefact survives into the output. An unresolved template binding, a generated class name from the design tool, a raw internal identifier.",
          "This matters specifically because the page was rebuilt from a design-tool export. Artefacts from that kind of source do not look like errors. They look like content. A stray binding renders as literal braces in the middle of a sentence, and if it lands in a section nobody scrolls to during review, it ships and stays shipped.",
          "It is worth naming the general rule: the checks worth automating are the ones that fail invisibly. A broken layout gets found in five minutes by the first person who looks. A missing canonical tag, an unparseable schema block, a leaked template binding in section eighteen: those can live in production indefinitely, because nothing about the page announces them.",
        ],
      },
      {
        heading: "Why it runs in the build, not in CI",
        body: [
          "The check is wired into the build command itself rather than sitting in a separate pipeline step. That is deliberate. A verification you can forget to run is a verification you will eventually forget to run, and the moment you most want it is the moment you are in a hurry.",
          "Attaching it to the build also means it protects the local preview and the deployment equally, without any configuration in the hosting platform. There is one command, it either produces a deployable directory or it fails with a reason, and there is no state in between.",
        ],
      },
      {
        heading: "Scaling this down",
        body: [
          "This is maybe a couple of hundred lines of Node. It is not a framework and it does not want to be one. It parses the built HTML, walks a handful of assertions, and exits non-zero with a message naming the element that failed.",
          "If you are shipping a hand-built page, start with three checks: every internal anchor resolves, every image has alt text, and every JSON-LD block parses. Those three cover the majority of what actually goes wrong and they take an afternoon.",
          "The point is not the specific list. It is that on a project with no type system, the invariants you care about still exist. They are just unwritten, and unwritten invariants are the ones that break.",
        ],
      },
    ],
    related: [{ label: "ERTH case study", href: "/work/erth" }],
  };
