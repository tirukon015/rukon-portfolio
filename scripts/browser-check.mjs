#!/usr/bin/env node
/**
 * Browser checks against a running build, in a real browser.
 *
 *   node scripts/browser-check.mjs [--base http://localhost:3100] [--quick] [--out report.json]
 *
 * Uses an installed Chrome or Edge through playwright-core (no browser
 * download): BROWSER_CHANNEL=chrome|msedge, default msedge on Windows and
 * chrome elsewhere.
 *
 * Fails on: console errors, uncaught exceptions, hydration warnings, failed
 * same-origin requests, broken images, horizontal overflow at any tested
 * width, a project link that does not open its page or reloads the document,
 * a mobile menu that does not close, a work filter that empties the list, and
 * serious or critical axe (WCAG 2 A/AA) violations.
 */
import fs from "node:fs";
import { createRequire } from "node:module";
import { chromium } from "playwright-core";

const require = createRequire(import.meta.url);
const AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

const args = process.argv.slice(2);
const opt = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : undefined);
const BASE = opt("--base") || process.env.CHECK_BASE || "http://localhost:3100";
const ORIGIN = process.env.SITE_ORIGIN || "https://www.rukon.dev";
const QUICK = args.includes("--quick");
const OUT = opt("--out");
const CHANNEL = process.env.BROWSER_CHANNEL || (process.platform === "win32" ? "msedge" : "chrome");

const WIDTHS = [320, 360, 375, 390, 414, 768, 1024, 1280, 1440, 1920];
const failures = [];
const notes = [];
const fail = (m) => failures.push(m);
const report = { routes: {}, perf: {}, axe: {}, interactions: [] };

const browser = await chromium.launch({ channel: CHANNEL });

/** A page with console, error and network listeners attached. */
async function openPage(width, height = 900, isMobile = width < 768) {
  const context = await browser.newContext({ viewport: { width, height }, isMobile, hasTouch: isMobile, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const log = { console: [], errors: [], failed: [] };
  page.on("console", (m) => {
    if (m.type() === "error" || (m.type() === "warning" && /hydrat|did not match|key prop|deprecated/i.test(m.text()))) log.console.push(`${m.type()}: ${m.text().slice(0, 300)}`);
  });
  page.on("pageerror", (e) => log.errors.push(String(e).slice(0, 300)));
  page.on("response", (r) => {
    const u = r.url();
    if (u.startsWith(BASE) && r.status() >= 400 && !u.includes("/this-route-does-not-exist")) log.failed.push(`${r.status()} ${u.slice(BASE.length)}`);
  });
  page.on("requestfailed", (r) => {
    const u = r.url();
    // Navigations aborted by the test itself are not failures.
    if (u.startsWith(BASE) && !/ERR_ABORTED/.test(r.failure()?.errorText || "")) log.failed.push(`failed ${u.slice(BASE.length)} ${r.failure()?.errorText}`);
  });
  return { context, page, log };
}

const local = (u) => (u.startsWith(ORIGIN) ? BASE + u.slice(ORIGIN.length) : u);
const rel = (u) => (u.startsWith(BASE) ? u.slice(BASE.length) || "/" : u);

async function overflow(page) {
  return page.evaluate(() => {
    const w = document.documentElement.clientWidth;
    const sw = document.documentElement.scrollWidth;
    if (sw <= w + 1) return null;
    // Report the widest offenders so the cause is findable.
    const off = [];
    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect();
      if (r.right > w + 1 && r.width > 0 && getComputedStyle(el).position !== "fixed") {
        let p = el.parentElement;
        let clipped = false;
        while (p) {
          const ox = getComputedStyle(p).overflowX;
          if (ox === "auto" || ox === "scroll" || ox === "hidden" || ox === "clip") {
            clipped = true;
            break;
          }
          p = p.parentElement;
        }
        if (!clipped) off.push(`${el.tagName.toLowerCase()}${el.className && typeof el.className === "string" ? "." + el.className.split(" ").slice(0, 3).join(".") : ""} (${Math.round(r.right)}px)`);
      }
      if (off.length > 4) break;
    }
    return { scrollWidth: sw, width: w, offenders: off };
  });
}

async function brokenImages(page) {
  return page.evaluate(async () => {
    const imgs = [...document.images];
    for (const i of imgs) i.loading = "eager";
    await Promise.all(imgs.map((i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; setTimeout(r, 8000); }))));
    return imgs.filter((i) => i.complete && i.naturalWidth === 0 && i.currentSrc).map((i) => i.currentSrc);
  });
}

function flush(label, log) {
  for (const c of log.console) fail(`${label}: console ${c}`);
  for (const e of log.errors) fail(`${label}: uncaught ${e}`);
  for (const f of [...new Set(log.failed)]) fail(`${label}: request ${f}`);
  log.console.length = log.errors.length = log.failed.length = 0;
}

// ---------------------------------------------------------------- routes
const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
let urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => local(m[1]));
const representative = [
  "/", "/work", "/work/rpoms", "/work/rpoms/case-study", "/work/rpoms-print-engine/case-study",
  "/work/laptop-qc-tool", "/work/researchforge/case-study", "/blog", "/blog/category/building-real-systems",
  "/blog/one-pure-function-for-preview-and-commit", "/blog/lan-serial-number-extraction-across-router-vendors",
  "/cv", "/access",
].map((p) => BASE + p);
if (QUICK) urls = representative;

for (const [width, label] of [[1366, "desktop"], [390, "mobile"]]) {
  const { context, page, log } = await openPage(width);
  for (const u of urls) {
    const r = await page.goto(u, { waitUntil: "load" });
    if (!r || r.status() !== 200) fail(`${label} ${rel(u)}: status ${r?.status()}`);
    await page.waitForTimeout(150);
    const of = await overflow(page);
    if (of) fail(`${label} ${rel(u)}: horizontal overflow ${of.scrollWidth}px > ${of.width}px: ${of.offenders.join(", ")}`);
    const broken = await brokenImages(page);
    for (const b of broken) fail(`${label} ${rel(u)}: broken image ${rel(b)}`);
    flush(`${label} ${rel(u)}`, log);
    report.routes[rel(u)] = report.routes[rel(u)] || {};
    report.routes[rel(u)][label] = r?.status();
  }
  await context.close();
}
console.log(`routes: ${urls.length} x desktop+mobile`);

// ----------------------------------------------------- viewport matrix
for (const w of WIDTHS) {
  const { context, page, log } = await openPage(w);
  for (const u of representative) {
    await page.goto(u, { waitUntil: "load" });
    await page.waitForTimeout(100);
    const of = await overflow(page);
    if (of) fail(`${w}px ${rel(u)}: horizontal overflow ${of.scrollWidth}px: ${of.offenders.join(", ")}`);
    flush(`${w}px ${rel(u)}`, log);
  }
  await context.close();
}
console.log(`viewport matrix: ${WIDTHS.length} widths x ${representative.length} routes`);

// --------------------------------------------- project link navigation
async function clickEachLink(startPath, selector, width, label) {
  const { context, page, log } = await openPage(width);
  await page.goto(BASE + startPath, { waitUntil: "load" });
  const hrefs = [...new Set(await page.$$eval(selector, (as) => as.map((a) => a.getAttribute("href"))))];
  for (const href of hrefs) {
    await page.goto(BASE + startPath, { waitUntil: "load" });
    await page.evaluate(() => { window.__noReload = true; });
    // The href filter must apply to every part of a comma-separated selector.
    const link = page.locator(selector.split(",").map((s) => `${s.trim()}[href="${href}"]`).join(", ")).first();
    await link.scrollIntoViewIfNeeded();
    await Promise.all([page.waitForURL((u) => u.pathname === href.split("#")[0], { timeout: 15000 }).catch(() => null), link.click()]);
    const path = new URL(page.url()).pathname;
    const h1 = await page.locator("h1").first().textContent({ timeout: 5000 }).catch(() => null);
    const spa = await page.evaluate(() => window.__noReload === true);
    const ok = path === href.split("#")[0] && !!h1;
    report.interactions.push({ from: startPath, label, click: href, expected: href, actual: path, h1: h1?.trim().slice(0, 60), clientSide: spa, status: ok ? "PASS" : "FAIL" });
    if (!ok) fail(`${label} click ${href} from ${startPath}: landed on ${path}, h1 ${h1 ? "present" : "missing"}`);
    if (ok && !spa) fail(`${label} click ${href} from ${startPath}: full document reload`);
    flush(`${label} click ${href}`, log);
  }
  await context.close();
  return hrefs.length;
}
const nWork = await clickEachLink("/work", 'main a[href^="/work/"]', 1366, "desktop");
const nHome = await clickEachLink("/", 'main a[href^="/work/"], main a[href^="/blog/"]', 1366, "desktop");
const nMobile = await clickEachLink("/work", 'main a[href^="/work/"]', 390, "mobile");
const nNav = await clickEachLink("/work/rpoms", 'header nav[aria-label="Primary"] a, footer a[href^="/"]', 1366, "desktop");
console.log(`clicked: /work ${nWork}, home ${nHome}, mobile /work ${nMobile}, header+footer ${nNav}`);

// --------------------------------------------------------- mobile menu
{
  const { context, page, log } = await openPage(390);
  const toggle = page.locator('button[aria-controls="mobile-nav"]');
  const menu = page.locator("#mobile-nav");
  const check = (name, cond) => {
    report.interactions.push({ label: "mobile menu", click: name, status: cond ? "PASS" : "FAIL" });
    if (!cond) fail(`mobile menu: ${name}`);
  };
  await page.goto(BASE + "/work", { waitUntil: "load" });
  await page.mouse.wheel(0, 1200);
  await toggle.click();
  check("opens", await menu.isVisible());
  await page.evaluate(() => { window.__noReload = true; });
  await Promise.all([page.waitForURL("**/blog"), menu.getByRole("link", { name: "Blog" }).click()]);
  check("link navigates to /blog", new URL(page.url()).pathname === "/blog");
  check("closes after navigation", !(await menu.isVisible()));
  check("scroll unlocked after navigation", (await page.evaluate(() => document.body.style.overflow)) === "");
  // Smooth scrolling animates to the top of <main>, just under the sticky
  // header: wait until the position settles, then allow the header's height.
  const settled = await page.evaluate(async () => {
    let last = -1;
    for (let i = 0; i < 40 && window.scrollY !== last; i++) {
      last = window.scrollY;
      await new Promise((r) => setTimeout(r, 100));
    }
    const header = document.querySelector("header")?.getBoundingClientRect().height ?? 0;
    return { y: window.scrollY, header };
  });
  check(`new page starts at top (y=${settled.y}, header ${settled.header}px)`, settled.y <= settled.header + 4);
  check("client-side navigation", await page.evaluate(() => window.__noReload === true));

  await toggle.click();
  await page.keyboard.press("Escape");
  check("Escape closes", !(await menu.isVisible()));
  check("Escape returns focus to the toggle", await page.evaluate(() => document.activeElement?.getAttribute("aria-controls") === "mobile-nav"));

  await toggle.click();
  await page.mouse.click(200, 700);
  check("outside click closes", !(await menu.isVisible()));

  await toggle.click();
  await page.goBack({ waitUntil: "load" });
  check("browser back returns to /work", new URL(page.url()).pathname === "/work");
  check("closes on browser back", !(await menu.isVisible()));
  check("scroll unlocked on browser back", (await page.evaluate(() => document.body.style.overflow)) === "");
  await page.goForward({ waitUntil: "load" });
  check("browser forward returns to /blog", new URL(page.url()).pathname === "/blog");

  // "Work" is a homepage section anchor by design (the header tracks sections).
  await toggle.click();
  await Promise.all([page.waitForURL((u) => u.pathname === "/" && u.hash === "#work"), menu.getByRole("link", { name: "Work" }).click()]);
  await page.waitForTimeout(800);
  check("Work opens the homepage work section", await page.evaluate(() => {
    const el = document.getElementById("work");
    if (!el) return false;
    const top = el.getBoundingClientRect().top;
    return top > -50 && top < window.innerHeight / 2;
  }));
  check("closes after anchor navigation", !(await menu.isVisible()));

  await page.setViewportSize({ width: 844, height: 390 });
  check("menu hidden in landscape (desktop nav)", !(await menu.isVisible()));
  flush("mobile menu", log);
  await context.close();
}

// ------------------------------------------------ filters, refresh, back
{
  const { context, page, log } = await openPage(1366);
  await page.goto(BASE + "/work", { waitUntil: "load" });
  const filters = page.locator('main button[aria-pressed]');
  const n = await filters.count();
  for (let i = 0; i < n; i++) {
    const name = (await filters.nth(i).textContent())?.trim();
    await filters.nth(i).click();
    const cards = await page.locator('main a[href^="/work/"]').count();
    const ok = cards > 0 && (await filters.nth(i).getAttribute("aria-pressed")) === "true";
    report.interactions.push({ label: "work filter", click: name, status: ok ? "PASS" : "FAIL", cards });
    if (!ok) fail(`work filter "${name}": ${cards} cards`);
  }
  if (n === 0) fail("work filter: no filter buttons with aria-pressed found");
  await page.goto(BASE + "/work/rpoms/case-study", { waitUntil: "load" });
  await page.reload({ waitUntil: "load" });
  if (!(await page.locator("h1").count())) fail("refresh of a deep URL lost the page");
  await page.goBack({ waitUntil: "load" });
  if (new URL(page.url()).pathname !== "/work") fail(`back from a case study landed on ${page.url()}`);
  flush("filters/refresh/back", log);
  await context.close();
}
console.log("interactions done");

// --------------------------------------------------------------- axe
for (const u of representative) {
  for (const scheme of ["light", "dark"]) {
    const { context, page } = await openPage(1366);
    await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
    await page.goto(u, { waitUntil: "load" });
    await page.addScriptTag({ content: AXE });
    const res = await page.evaluate(async () => {
      // eslint-disable-next-line no-undef
      const r = await axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] }, resultTypes: ["violations"] });
      return r.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, sample: v.nodes[0]?.target?.join(" ") }));
    });
    report.axe[`${rel(u)} (${scheme})`] = res;
    for (const v of res) {
      const msg = `axe ${rel(u)} (${scheme}): ${v.id} [${v.impact}] x${v.nodes} e.g. ${v.sample}`;
      if (v.impact === "serious" || v.impact === "critical") fail(msg);
      else notes.push(msg);
    }
    await context.close();
  }
}
console.log("axe done");

// --------------------------------------------------------- performance
for (const [w, label] of [[1366, "desktop"], [390, "mobile"]]) {
  for (const p of ["/", "/work", "/work/rpoms/case-study", "/blog", "/blog/one-pure-function-for-preview-and-commit"]) {
    const { context, page } = await openPage(w);
    await page.addInitScript(() => {
      window.__lcp = 0;
      window.__cls = 0;
      new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto(BASE + p, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    const m = await page.evaluate(() => {
      const nav = performance.getEntriesByType("navigation")[0];
      const res = performance.getEntriesByType("resource");
      const fcp = performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? null;
      const js = res.filter((r) => r.initiatorType === "script" || r.name.endsWith(".js"));
      return {
        ttfb: Math.round(nav.responseStart),
        fcp: fcp && Math.round(fcp),
        lcp: Math.round(window.__lcp),
        cls: Number(window.__cls.toFixed(3)),
        jsKB: Math.round(js.reduce((s, r) => s + (r.encodedBodySize || 0), 0) / 1024),
        docKB: Math.round((nav.encodedBodySize || 0) / 1024),
        totalKB: Math.round((res.reduce((s, r) => s + (r.encodedBodySize || 0), 0) + (nav.encodedBodySize || 0)) / 1024),
        requests: res.length + 1,
      };
    });
    report.perf[`${p} (${label})`] = m;
    if (m.cls > 0.1) fail(`perf ${p} (${label}): CLS ${m.cls}`);
    await context.close();
  }
}
console.log("performance done");

await browser.close();
if (OUT) fs.writeFileSync(OUT, JSON.stringify({ failures, notes, ...report }, null, 2));
console.table(report.perf);
for (const n of notes) console.log(`  note: ${n}`);
for (const f of failures) console.log(`  FAIL: ${f}`);
console.log(failures.length ? `browser-check: ${failures.length} failure(s)` : "browser-check: OK");
process.exit(failures.length ? 1 : 0);
