import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "porting-a-static-page-to-nextjs-without-visual-drift",
  title: "Porting a Static Page to Next.js Without Visual Drift",
  description:
    "Rebuilding a finished page in Next.js 16 and Tailwind 4 so it looks identical: the font fallback, image optimiser and class-conflict traps, and how drift was checked.",
  date: "2026-10-02",
  category: "Full-Stack Development",
  tags: ["Next.js", "Tailwind CSS", "next/font", "next/image", "Visual QA", "TypeScript"],
  contentType: "Technical Guide",
  searchIntent: "problem-aware",
  seoTitle: "Port a Static Site to Next.js Without Visual Drift",
  relatedProjects: ["erth"],
  relatedPosts: [
    "rebuilding-a-design-prototype-as-a-production-website",
    "cutting-a-page-image-payload-from-12mb-to-under-3mb",
    "structured-data-for-a-local-recycling-business",
    "translating-figma-components-into-reusable-code",
  ],
  sections: [
    {
      heading: "The goal: change the technology, not the result",
      body: [
        "The ERTH homepage, for a Malaysian e-waste collection service, already existed as a finished, approved design. Its deployed version is a static page, HTML, CSS and a few kilobytes of vanilla JavaScript bundled by Vite. I then rebuilt the same page as a Next.js 16 App Router application with React 19, strict TypeScript and Tailwind CSS 4: 21 section components, all copy as typed data, and structured data in its own module.",
        "The brief I set for the rebuild was a faithful port. Same design, same copy, same assets, same behaviour. Any pixel that moved was a defect unless it was a deliberate fix. This article is for anyone moving a hand-built or exported page into a framework and discovering that the framework's defaults are not neutral: they change fonts, images and layout in small ways that add up.",
        {
          type: "callout",
          label: "Status, stated plainly",
          text: "This rebuild is local. It is not deployed, and its work is not committed beyond the initial scaffold. It was rebuilt from the v13 design file, while the client's approved final is v14, which is what the deployed static page implements. Before this version could replace the live page it would have to be reconciled with v14. Nothing below describes production behaviour.",
        },
      ],
    },
    {
      heading: "Server Components by default, client code only where it interacts",
      body: [
        "Almost the whole page is static content, so every section is a Server Component that prerenders to HTML. Client Components exist only where interaction needs them: the fixed header with its dropdowns, the mobile menu, the booking dialog with its context provider and buttons, and a disclosure primitive used by the show/hide toggles. That keeps the first paint identical to a static page and means layout never waits for hydration.",
        "Design tokens came across from the original into one Tailwind `@theme` block: every colour, the fonts, and one structural breakpoint. The original switches layout at exactly one width, 1080px, so the rebuild defines `--breakpoint-nav: 67.5rem` and uses it for the desktop navigation, the mobile menu and the narrow-screen sticky call to action. Everything else stays fluid with the same `clamp()` values the original used.",
      ],
    },
    {
      heading: "Trap one: next/font's fallback metrics",
      body: [
        "`next/font` improves layout stability by generating a metric-adjusted fallback font, so text set in the fallback occupies roughly the same space as the web font. That is usually what you want. Here it was a visible change: the font files are Latin subsets, and characters outside the subset, the arrow \"→\" for example, fall back. On the original they fell back to the system font. With `next/font` they fell back to a metric-adjusted Arial and looked different.",
        {
          type: "code",
          lang: "ts",
          code: "const archivo = localFont({\n  src: \"./fonts/archivo-latin.woff2\",\n  weight: \"500 700\",\n  display: \"swap\",\n  adjustFontFallback: false,\n  variable: \"--font-archivo\",\n});",
          caption: "From app/layout.tsx. The same option is set on all three font families.",
        },
        "Turning off `adjustFontFallback` gives back the original's fallback behaviour. The trade-off is real: you lose the layout-shift protection the adjustment provides during font swap. For a port whose goal is matching an approved design, matching won.",
      ],
    },
    {
      heading: "Trap two: next/image and tiny logos",
      body: [
        "The client-logo row renders small image files at their intrinsic size, capped by a maximum height. Through the image optimiser, the generated `srcset` misreported the intrinsic size of these very small files, and the logos rendered smaller than on the original. The fix was to serve them `unoptimized`, with a comment saying why, so nobody removes it as an oversight.",
        "The larger photographs are the opposite case and do benefit from the optimiser. The weight work on the original page, WebP and responsive variants, is covered in [Cutting a Page's Image Payload From 12 MB to Under 3 MB](/blog/cutting-a-page-image-payload-from-12mb-to-under-3mb). The lesson is not \"avoid next/image\" but \"check each image class against the original\", because the optimiser's choice is right for photos and wrong for these logos.",
      ],
    },
    {
      heading: "Trap three: utility classes that fight each other",
      body: [
        "Two smaller drifts came from Tailwind itself. A header call to action carried both a `hidden` utility and an `inline-flex` utility, and the conflict between them meant it showed on mobile when the original hid it. And the order of CSS filter functions on some elements did not match the original's, which changes the result, because filters apply in sequence. Both were caught by comparison rather than by reading code, which is the argument for the next section.",
      ],
    },
    {
      heading: "How it was checked, and the one deliberate change",
      body: [
        "Visual QA compared the rebuild with the original at five widths: 390, 834, 1280, 1440 and 2560px. The recorded result is identical section heights at every width and no position differences on mobile. Section heights are a blunt but effective check: if every section has the same height as the original at every width, most drift has nowhere to hide, and the ones that remain, like a wrong glyph, are the kind you then look for by eye.",
        "Exactly one visual difference was intended. In the original file, a stray closing tag ended the page wrapper early, so headings after one section inherited no light text colour and rendered black on a near-black background, effectively invisible. The rebuild shows them in the intended colour. The same defect, and the others a rebuild tends to expose, are described in [Rebuilding a Design-Tool Prototype as a Production Website](/blog/rebuilding-a-design-prototype-as-a-production-website).",
        "The rebuild also adds things the original lacked without changing how it looks: a `lang` attribute, a skip link, visible focus rings, Escape to close, focus trapping and restoration in dialogs, semantic landmarks, and a favicon made from the design bundle's own loader glyph. The booking form URL is read from an optional environment variable and accepted only if it parses as an `http` or `https` URL; otherwise the dialog lists the contact channels, as the original does by default. The Organization and FAQPage structured data were carried over as-is; how that markup is built is in [Structured Data for a Local Recycling Business](/blog/structured-data-for-a-local-recycling-business).",
      ],
    },
    {
      heading: "A short checklist for a faithful port",
      body: [
        {
          type: "list",
          items: [
            "Decide up front that drift is a defect, and list any deliberate fixes by name.",
            "Carry tokens and breakpoints across exactly; do not \"tidy\" them into the framework's defaults.",
            "Check font fallback behaviour for characters outside your subsets.",
            "Compare every image class through the optimiser, especially small fixed-size images.",
            "Look for utility-class conflicts on elements that change visibility across breakpoints.",
            "Compare against the original at several widths with a measurable check such as section heights, then by eye.",
          ],
        },
        "The project, including which build is deployed and which is not, is described on the [ERTH project page](/work/erth).",
      ],
    },
  ],
};
