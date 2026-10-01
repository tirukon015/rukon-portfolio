import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "nextjs-opengraph-metadata-replaces-not-merges",
  title: "Next.js Open Graph Metadata Replaces, It Doesn't Merge",
  description:
    "A child route that sets its own openGraph object silently drops the layout's og:image and og:locale. Why Next.js does that, and the helper this site uses to stop it.",
  date: "2026-11-24",
  category: "Full-Stack Development",
  tags: ["Next.js", "Open Graph", "Metadata API", "Technical SEO", "TypeScript"],
  contentType: "Problem/Solution",
  searchIntent: "problem-aware",
  seoTitle: "Next.js openGraph Overrides Drop og:image and Locale",
  relatedProjects: [],
  relatedPosts: [
    "canonical-urls-apex-www-308-sitemap-redirects-nextjs",
    "one-json-ld-graph-person-referenced-by-id",
    "theme-specific-logos-without-a-flash",
  ],
  sections: [
    {
      heading: "The symptom: share cards that lose their image",
      body: [
        "You set a default share image and `og:locale` in the root layout's `openGraph`. A page then sets its own `openGraph` to give itself a proper title. Shared on a messaging app or a social network, that page now has no image, and the locale tag has gone from its head. Nothing errors. This note is for anyone using the Next.js App Router Metadata API who has hit that, or is about to.",
      ],
    },
    {
      heading: "Why: metadata is merged shallowly",
      body: [
        "Next.js evaluates metadata from the root layout down to the page and merges the objects shallowly. Its own documentation for `generateMetadata` says that nested fields such as `openGraph` and `robots` defined in an earlier segment are overwritten by the last segment to define them. So `openGraph` is one key. If the page defines it at all, the page's object replaces the layout's whole object, and every field the page did not repeat, `images`, `locale`, `siteName`, `type`, is gone.",
        "Top-level keys like `title` and `description` behave the way you would expect, which is why this catches people: the page's title appears correctly in the tab and in search results, and only the share preview is wrong.",
      ],
    },
    {
      heading: "The fix on this site: a helper that reapplies the defaults",
      body: [
        "Rather than remember the defaults on every page, every route builds its `openGraph` and `twitter` blocks through two helpers in `src/lib/seo.ts`. The comment on the default image states the reason:",
        {
          type: "code",
          lang: "ts",
          code: "/**\n * Referenced explicitly rather than relied on implicitly: a route that defines\n * its own `openGraph` object replaces the parent's instead of merging into it,\n * so `locale` and `images` silently disappear from every child route unless\n * they are set again. This helper is what stops that happening per page.\n */\nexport const OG_IMAGE = { url: \"/opengraph-image\", width: 1200, height: 630, alt: \"...\" };",
          caption: "From src/lib/seo.ts, alt text elided.",
        },
        "`openGraphFor()` takes the page's title, description, URL and type, and returns a complete object: the title suffixed with the site name, `siteName`, `locale` (`en_MY` here), and `images` set to either the page's own image or the default. For `type: \"article\"` it also adds `authors`, `publishedTime`, `modifiedTime`, `section` and `tags` when given. `twitterFor()` does the same for the Twitter card, defaulting to `summary_large_image` and the same image.",
        {
          type: "code",
          lang: "ts",
          code: "openGraph: openGraphFor({\n  title,\n  description,\n  url: \"/work/\" + project.slug + \"/case-study\",\n  type: \"article\",\n  ...(share ? { image: { url: share.src, width: share.width, height: share.height, alt: share.alt } } : {}),\n}),\ntwitter: twitterFor(title, description, share?.src),",
          caption: "Simplified from the case-study page's generateMetadata: a project with its own share image passes it; others fall back to the default.",
        },
      ],
    },
    {
      heading: "Per-article images with the file convention",
      body: [
        "Articles get their own card. `src/app/blog/[slug]/opengraph-image.tsx` uses `ImageResponse` to draw the article title, category and site wordmark at 1200 by 630, with `generateStaticParams` listing the published articles. It uses no remote fonts, so it renders the same everywhere, and it reduces the headline size for titles longer than 60 characters.",
        "The article page also names that image explicitly in its own `openGraph` and `twitter` blocks, with width, height and the title as alt text, rather than relying only on the file convention. File-based metadata does take priority over the metadata object, but naming it means the JSON-LD `image` field, the Open Graph tag and the Twitter tag are visibly built from the same URL in one place. The structured-data side is described in [One Person, Referenced Everywhere](/blog/one-json-ld-graph-person-referenced-by-id).",
      ],
    },
    {
      heading: "How to check your own site",
      body: [
        "View the source of a deep page, not the homepage, and look for `og:image` and `og:locale`. If either is missing on a page that sets `openGraph`, this is the cause. The fix does not need a library: one function that returns a complete object, used by every route. The related canonical-URL problem, where `og:url` named a URL that redirects, is described in [Canonicals That Pointed at a Redirect](/blog/canonical-urls-apex-www-308-sitemap-redirects-nextjs).",
      ],
    },
  ],
};
