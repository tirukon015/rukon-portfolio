#!/usr/bin/env node
/**
 * Site checker: runs against a running build (`next start`) and fails on
 * anything a visitor or a crawler would hit.
 *
 *   node scripts/check-site.mjs [--base http://localhost:3100] [--external]
 *
 * Checks
 *   - every sitemap URL answers 200, no duplicates, no private routes
 *   - every internal link and image on every page resolves (redirects allowed,
 *     loops and chains reported), no `href="#"`, no `undefined`/`null` hrefs
 *   - every indexable page has a unique title, a description, a canonical that
 *     matches its own URL, Open Graph and Twitter tags, exactly one <h1>
 *   - every JSON-LD block parses
 *   - feed.xml is well-formed and every item link resolves
 *   - robots.txt names the sitemap and disallows private routes
 *   - an unknown URL answers 404
 *   - no confidential original term (read from the registry at runtime) and no
 *     visible "undefined" / "[object Object]" in any page, feed, sitemap or
 *     browser JS chunk
 *   - with --external, every external link is fetched (HEAD, then GET)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const BASE = (args.includes("--base") ? args[args.indexOf("--base") + 1] : process.env.CHECK_BASE) || "http://localhost:3100";
const ORIGIN = process.env.SITE_ORIGIN || "https://www.rukon.dev";
const EXTERNAL = args.includes("--external");
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const failures = [];
const warnings = [];
const fail = (m) => failures.push(m);
const warn = (m) => warnings.push(m);

const toLocal = (u) => (u.startsWith(ORIGIN) ? BASE + u.slice(ORIGIN.length) : u);
const toPath = (u) => (u.startsWith(ORIGIN) ? u.slice(ORIGIN.length) || "/" : u);

async function get(url, opts = {}) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { redirect: "manual", ...opts, signal: AbortSignal.timeout(20000) });
      const body = opts.method === "HEAD" ? "" : await res.text();
      return { status: res.status, location: res.headers.get("location"), body, headers: res.headers };
    } catch (e) {
      if (attempt === 2) return { status: 0, error: String(e), body: "" };
    }
  }
}

/** Follows redirects manually so loops and chains are visible. */
async function resolve(url, max = 5) {
  const hops = [];
  let cur = url;
  for (let i = 0; i <= max; i++) {
    const r = await get(cur, { method: "GET" });
    if (r.status >= 300 && r.status < 400 && r.location) {
      const next = new URL(r.location, cur).toString();
      if (hops.includes(next)) return { status: r.status, hops, loop: true };
      hops.push(next);
      cur = next.startsWith(ORIGIN) ? toLocal(next) : next;
      continue;
    }
    return { ...r, hops, final: cur };
  }
  return { status: 0, hops, chain: true };
}

async function pool(items, n, fn) {
  const out = [];
  let i = 0;
  await Promise.all(
    Array.from({ length: n }, async () => {
      while (i < items.length) {
        const idx = i++;
        out[idx] = await fn(items[idx]);
      }
    }),
  );
  return out;
}

const attr = (tag, name) => {
  const m = tag.match(new RegExp(`${name}="([^"]*)"`, "i"));
  return m ? m[1].replace(/&amp;/g, "&") : undefined;
};
const meta = (html, key) => {
  for (const t of html.match(/<meta [^>]*>/gi) || []) {
    if (attr(t, "name") === key || attr(t, "property") === key) return attr(t, "content");
  }
  return undefined;
};

function confidentialTerms() {
  const src = fs.readFileSync(path.join(ROOT, "src/lib/confidentiality/registry.ts"), "utf8");
  const terms = new Set();
  // Entities whose public form differs from the original, except hardware
  // models (deliberately allowed in the vendor-protocol article; see registry).
  const entity = /original:\s*"([^"]+)",\s*\n\s*publicAlternative:\s*"([^"]+)",\s*\n\s*classification:\s*"([^"]+)"/g;
  for (const m of src.matchAll(entity)) {
    if (m[1] !== m[2] && m[3] !== "hardware") terms.add(m[1]);
  }
  // Short forms and original slugs that differ from the public slug.
  for (const m of src.matchAll(/^\s+"?([a-z-]+)"?:\s*"([a-z-]+)",$/gm)) if (m[1] !== m[2]) terms.add(`/work/${m[1]}`);
  ["Blue Bee", "BBTech", "Maxis", "bbtech.com.my", "router-diagnostic"].forEach((t) => terms.add(t));
  // A word-bounded ERTH: the client's name, never a substring of another word.
  return { literals: [...terms], regexes: [/\bERTH\b/] };
}

/**
 * Deliberate public exceptions, each an open owner decision rather than an
 * oversight (see the private re-audit report): the client homepage's own live
 * URL and its public repository, linked from the website case study.
 */
const ALLOWED_PUBLIC = ["https://erth-homepage.vercel.app", "github.com/tirukon015/erth-homepage"];

function scanConfidential(label, raw, terms) {
  let text = raw;
  for (const a of ALLOWED_PUBLIC) text = text.split(a).join("");
  for (const t of terms.literals) {
    const esc = t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Paths end at a boundary (`/work/erth` is not `/work/erth-…`); names are
    // case-sensitive whole words ("ERTH" is not "afterthought").
    const re = t.startsWith("/work/")
      ? new RegExp(esc + "(?=[\"'?#\\s<\\\\]|$)")
      : new RegExp("(?<![A-Za-z])" + esc + "(?![A-Za-z])");
    if (re.test(text)) fail(`confidential term "${t}" in ${label}`);
  }
  for (const re of terms.regexes) if (re.test(text)) fail(`confidential term ${re} in ${label}`);
}

async function main() {
  console.log(`check-site: ${BASE} (canonical origin ${ORIGIN})`);
  const terms = confidentialTerms();

  // --- robots
  const robots = await get(`${BASE}/robots.txt`);
  if (robots.status !== 200) fail(`robots.txt ${robots.status}`);
  if (!robots.body.includes(`${ORIGIN}/sitemap.xml`)) fail("robots.txt does not name the sitemap");
  for (const p of ["/admin", "/api/"]) if (!robots.body.includes(`Disallow: ${p}`)) fail(`robots.txt does not disallow ${p}`);

  // --- sitemap
  const sm = await get(`${BASE}/sitemap.xml`);
  if (sm.status !== 200) fail(`sitemap ${sm.status}`);
  const urls = [...sm.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const dup = urls.filter((u, i) => urls.indexOf(u) !== i);
  if (dup.length) fail(`sitemap duplicates: ${dup.join(", ")}`);
  for (const u of urls) {
    if (!u.startsWith(ORIGIN)) fail(`sitemap URL outside origin: ${u}`);
    if (/\/(admin|api|access)(\/|$)/.test(u)) fail(`private route in sitemap: ${u}`);
  }
  scanConfidential("sitemap.xml", sm.body, terms);

  const pages = await pool(urls, 8, async (u) => ({ url: u, ...(await get(toLocal(u))) }));
  const titles = new Map();
  const descs = new Map();
  const links = new Set();
  const images = new Set();
  const external = new Set();

  for (const p of pages) {
    const where = toPath(p.url);
    if (p.status !== 200) {
      fail(`sitemap URL ${where} -> ${p.status}${p.location ? ` (${p.location})` : ""}`);
      continue;
    }
    const html = p.body;
    scanConfidential(where, html, terms);
    // A rendering bug shows up as a whole text node ("undefined", "null",
    // "NaN") or a stringified object; prose and code samples that mention
    // these words are fine.
    const markup = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<(pre|code)[\s\S]*?<\/\1>/gi, "");
    if (/>\s*(undefined|null|NaN)\s*</.test(markup) || markup.includes("[object Object]")) fail(`"undefined"/"null"/"NaN"/"[object Object]" rendered on ${where}`);

    const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1];
    if (!title) fail(`no <title> on ${where}`);
    else titles.set(title, [...(titles.get(title) || []), where]);
    const desc = meta(html, "description");
    if (!desc) fail(`no meta description on ${where}`);
    else descs.set(desc, [...(descs.get(desc) || []), where]);
    const canonical = (html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
    if (!canonical) fail(`no canonical on ${where}`);
    else if (canonical !== p.url) fail(`canonical mismatch on ${where}: ${canonical}`);
    for (const k of ["og:title", "og:description", "og:url", "og:image", "twitter:card"]) if (!meta(html, k)) fail(`no ${k} on ${where}`);
    const robotsMeta = meta(html, "robots");
    if (robotsMeta && /noindex/.test(robotsMeta)) fail(`sitemap page is noindex: ${where}`);
    const h1 = (html.match(/<h1[\s>]/g) || []).length;
    if (h1 !== 1) fail(`${h1} <h1> elements on ${where}`);

    for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
      try {
        JSON.parse(m[1]);
      } catch (e) {
        fail(`invalid JSON-LD on ${where}: ${e.message}`);
      }
    }
    for (const m of html.matchAll(/<a [^>]*href="([^"]*)"/g)) {
      const h = m[1].replace(/&amp;/g, "&");
      if (h === "#" || h === "" || /(^|[/=])(undefined|null)([/&?#]|$)/.test(h)) fail(`bad href "${h}" on ${where}`);
      else if (h.startsWith("/")) links.add(h.split("#")[0]);
      else if (/^https?:/.test(h)) external.add(h);
    }
    for (const m of html.matchAll(/<img [^>]*>/g)) {
      const src = attr(m[0], "src");
      if (!src) fail(`<img> without src on ${where}`);
      else if (src.startsWith("/")) images.add(src);
      if (attr(m[0], "alt") === undefined) fail(`<img> without alt on ${where}: ${src}`);
    }
  }
  for (const [t, ps] of titles) if (ps.length > 1) fail(`duplicate title "${t}" on ${ps.join(", ")}`);
  for (const [d, ps] of descs) if (ps.length > 1) warn(`duplicate description on ${ps.join(", ")}`);

  // --- internal links and images
  const linkResults = await pool([...links], 8, async (l) => ({ l, r: await resolve(BASE + l) }));
  for (const { l, r } of linkResults) {
    if (r.loop) fail(`redirect loop: ${l}`);
    else if (r.chain) fail(`redirect chain too long: ${l}`);
    else if (r.status !== 200) fail(`internal link ${l} -> ${r.status}`);
    else if (r.hops.length > 1) warn(`internal link ${l} takes ${r.hops.length} redirects`);
    else if (r.hops.length === 1) warn(`internal link ${l} redirects to ${toPath(r.hops[0])}`);
    for (const h of r.hops || []) scanConfidential(`redirect target of ${l}`, h, terms);
  }
  const imgResults = await pool([...images], 8, async (src) => ({ src, r: await get(BASE + src, { method: "HEAD" }) }));
  for (const { src, r } of imgResults) if (r.status !== 200) fail(`image ${src} -> ${r.status}`);

  // --- feed
  const feed = await get(`${BASE}/feed.xml`);
  if (feed.status !== 200) fail(`feed.xml ${feed.status}`);
  if (!/^<\?xml[^>]*encoding="UTF-8"/i.test(feed.body.trim())) fail("feed.xml has no UTF-8 XML declaration");
  const items = [...feed.body.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]);
  if (!items.length) fail("feed.xml has no items");
  for (const it of items) {
    const link = (it.match(/<link>([^<]+)<\/link>/) || [])[1];
    if (!link || !link.startsWith(ORIGIN)) fail(`feed item with bad link: ${link}`);
    else if (!urls.includes(link)) fail(`feed item not in sitemap: ${link}`);
    if (!/<title>[^<]+<\/title>/.test(it)) fail(`feed item without title: ${link}`);
    if (!/<pubDate>[^<]+<\/pubDate>/.test(it) || Number.isNaN(Date.parse((it.match(/<pubDate>([^<]+)</) || [])[1]))) fail(`feed item bad pubDate: ${link}`);
  }
  if (/&(?!(amp|lt|gt|quot|apos|#\d+|#x[0-9a-f]+);)/i.test(feed.body.replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, ""))) fail("feed.xml has an unescaped &");
  scanConfidential("feed.xml", feed.body, terms);

  // --- 404
  const nf = await get(`${BASE}/this-route-does-not-exist-${Date.now()}`);
  if (nf.status !== 404) fail(`unknown route answers ${nf.status}, not 404`);
  const nfWork = await get(`${BASE}/work/this-project-does-not-exist`);
  if (nfWork.status !== 404) fail(`unknown project answers ${nfWork.status}, not 404`);
  const nfBlog = await get(`${BASE}/blog/this-article-does-not-exist`);
  if (nfBlog.status !== 404) fail(`unknown article answers ${nfBlog.status}, not 404`);

  // --- browser JS
  const staticDir = path.join(ROOT, ".next/static");
  if (fs.existsSync(staticDir)) {
    const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
    const files = walk(staticDir);
    for (const f of files.filter((f) => f.endsWith(".js"))) scanConfidential(`browser chunk ${path.basename(f)}`, fs.readFileSync(f, "utf8"), terms);
    const maps = files.filter((f) => f.endsWith(".map"));
    if (maps.length) fail(`${maps.length} source maps in .next/static`);
  } else warn(".next/static not found: browser chunks not scanned");

  // --- external links (opt-in: network)
  if (EXTERNAL) {
    const ext = [...external].filter((u) => !u.startsWith(ORIGIN));
    const res = await pool(ext, 6, async (u) => {
      let r = await get(u, { method: "HEAD", redirect: "follow", headers: { "user-agent": "Mozilla/5.0 (link check)" } });
      if (r.status === 0 || r.status === 405 || r.status === 403) r = await get(u, { redirect: "follow", headers: { "user-agent": "Mozilla/5.0 (link check)" } });
      return { u, r };
    });
    for (const { u, r } of res) {
      if (!u.startsWith("https://")) fail(`external link not HTTPS: ${u}`);
      if (r.status >= 400 || r.status === 0) (/linkedin\.com/.test(u) && r.status === 999 ? warn : fail)(`external link ${u} -> ${r.status || r.error}`);
    }
    console.log(`external links checked: ${ext.length}`);
  }

  console.log(`pages: ${pages.length}, internal links: ${links.size}, images: ${images.size}, feed items: ${items.length}`);
  for (const w of warnings) console.log(`  warn: ${w}`);
  for (const f of failures) console.log(`  FAIL: ${f}`);
  console.log(failures.length ? `check-site: ${failures.length} failure(s)` : "check-site: OK");
  process.exit(failures.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
