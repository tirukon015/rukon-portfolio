import type { BlogPost } from "../types";

export const post: BlogPost = {
    slug: "cutting-a-page-image-payload-from-12mb-to-under-3mb",
    title: "Cutting a Page's Image Payload From 12 MB to Under 3 MB",
    description:
      "The performance and accessibility pass on a production homepage: what was actually slow, what fixed it, and why most of it was not clever.",
    date: "2026-09-03",
    category: "Full-Stack Development",
    tags: ["Performance", "Accessibility", "Images", "Fonts", "Core Web Vitals"],
    contentType: "Problem/Solution",
    searchIntent: "problem-aware",
    relatedProjects: ["erth"],
    relatedPosts: [
      "rebuilding-a-design-prototype-as-a-production-website",
      "designing-for-desktop-and-mobile-before-development",
    ],
    sections: [
      {
        heading: "Where the weight was",
        body: [
          "The ERTH homepage is a single long page with a lot of photography: devices, collection scenes, an award plaque, press logos. As it came out of the design tool the image payload was 12.0 MB.",
          "That number is not unusual and it is not anybody's fault. Design tools export at the fidelity the designer was working at, because that is the correct default for design. It just is not the correct default for a phone on mobile data in Malaysia.",
          "After the pass it is 2.7 MB. Nothing in the design changed. No image was dropped, cropped or replaced.",
        ],
      },
      {
        heading: "What actually did it",
        body: [
          "Re-encoding to WebP did most of the work. Photographic and illustrative assets converted at a sensible quality, which for this page was visually indistinguishable at every size the design uses.",
          "srcset on the largest images did the rest. The hero backdrop and the collection-centre photograph are the two assets that dominate on a big screen and are wildly oversized on a small one, so those got width variants and a browser that picks.",
          "That is the entire image strategy. Two techniques, both older than most of the frameworks people reach for, applied to the assets that actually mattered rather than uniformly to everything.",
        ],
      },
      {
        heading: "Stopping the page from moving",
        body: [
          "Payload is only half of it. The other half is whether the page holds still while it loads, and that is a separate fix with a separate mechanism.",
          "Every image carries intrinsic width and height attributes. The browser can then reserve the correct box before the bytes arrive, so text does not jump down the page as photographs appear. This costs two attributes per image and it is the single highest-value accessibility and usability fix in the whole pass, because a page that moves under your finger while you are reading is genuinely hostile.",
          "Below-the-fold images are lazy, and the hero backdrop is explicitly marked high priority so the lazy default does not deprioritise the one image that is on screen immediately.",
        ],
      },
      {
        heading: "Fonts, self-hosted and subset",
        body: [
          "The fonts are self-hosted as WOFF2 subsets rather than pulled from a font service. Combined with self-hosting the images, that takes the page to zero third-party requests.",
          "There are two reasons and only one of them is speed. The first is that a third-party font request is a dependency on someone else's availability and TLS handshake, sitting directly in the path of your first paint. The second is that it is a request to another party's server carrying your visitor's IP address, which for a Malaysian consumer service handling people's old devices and personal data is a conversation worth not having at all.",
          "The two Latin subsets that the page actually renders in are preloaded. The rest are declared and fetched only if a visitor's content needs them.",
        ],
      },
      {
        heading: "Accessibility in the same pass",
        body: [
          "Performance and accessibility got done together, because on a static rebuild they touch the same markup and splitting them means editing everything twice.",
          "What went in: a skip link, main, nav, footer and aside landmarks, accessible names on the sections that carry no heading, a visible focus ring on every interactive element, aria-expanded and aria-controls on all disclosures and dropdowns, Escape and focus trapping in both dialogs with focus returned to whatever opened them, keyboard-operable navigation dropdowns, underlines on inline links that colour alone did not distinguish, and prefers-reduced-motion honoured.",
          "axe-core reports zero violations across five states: default, mobile, menu open, dialog open, disclosure open. Testing the states matters more than testing the page. Almost every accessibility bug I have found in an interactive component lives in a state the automated pass never opened.",
        ],
      },
      {
        heading: "The unglamorous conclusion",
        body: [
          "None of this was clever. WebP, srcset, width and height attributes, lazy loading, self-hosted subset fonts, landmarks and focus management. All of it is a decade old or more and all of it is in every guide.",
          "The reason it is worth writing down anyway is that a 12 MB page is not usually the result of someone not knowing about WebP. It is the result of a handoff where the performance pass was nobody's explicit job. On this build it was written into the definition of done, alongside a build check that fails if an image loses its alt text or its dimensions, which is the part that keeps it true after the next edit.",
        ],
      },
    ],
    related: [{ label: "ERTH case study", href: "/work/erth" }],
  };
