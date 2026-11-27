import { allProjects, publicProjects, getProject } from "../src/content/projects";
import { publishedPosts, getPost } from "../src/content/posts";
import { getExperience } from "../src/content/experience";
import { getPublicSlug, getOriginalSlug } from "../src/lib/confidentiality/registry";
import fs from "node:fs";
import path from "node:path";

let passed = 0;
let failed = 0;

function assert(condition: boolean, name: string, detail?: string) {
  if (condition) {
    passed++;
    console.log(`  [PASS] ${name}`);
  } else {
    failed++;
    console.error(`  [FAIL] ${name} ${detail ? "- " + detail : ""}`);
  }
}

console.log("==================================================");
console.log("CONFIDENTIALITY & SECURITY VERIFICATION SUITE");
console.log("==================================================\n");

// 1. Projects Verification
console.log("1. Verifying All 15 Projects (Public vs Authorized)...");
assert(allProjects.length === 15, "Private allProjects contains exactly 15 projects");
const nonHiddenCount = allProjects.filter((p) => !p.hidden).length;
assert(publicProjects.length === nonHiddenCount, `Public publicProjects contains ${nonHiddenCount} visible projects (1 hidden project preserved)`);

for (const p of publicProjects) {
  const contentToAudit = JSON.stringify({
    name: p.name,
    fullName: p.fullName,
    tagline: p.tagline,
    summary: p.summary,
    affiliation: p.affiliation,
    hrOverview: p.hrOverview,
    sections: p.sections,
    workflow: p.workflow,
    highlights: p.highlights,
    status: p.status,
  });

  const hasBBTech = /\bBBTech\b/i.test(contentToAudit);
  const hasBlueBee = /Blue Bee Technologies/i.test(contentToAudit);
  const hasRawMaxis = /\bMaxis\b/i.test(contentToAudit);
  const hasKaonAR2140 = /Kaon\s+AR2140/i.test(contentToAudit);

  assert(!hasBBTech, `Public project [${p.slug}] has no BBTech in copy`);
  assert(!hasBlueBee, `Public project [${p.slug}] has no Blue Bee Technologies in copy`);
  assert(!hasRawMaxis, `Public project [${p.slug}] has no Maxis in copy`);
  assert(!hasKaonAR2140, `Public project [${p.slug}] has no confidential Kaon AR2140`);
}

// Check specific flagship project
const pubFlagship = getProject("rpoms", false);
assert(Boolean(pubFlagship), "getProject resolves authentic public slug 'rpoms'");
assert(pubFlagship?.name === "RPOMS", "Public flagship preserves authentic name RPOMS");
assert(pubFlagship?.fullName === "Router Production Operations Management System", "Public flagship preserves authentic full name");
assert(!/Blue Bee|Maxis|ERTH/i.test(pubFlagship?.affiliation ?? ""), "Public flagship has confidential affiliation anonymized");
assert(pubFlagship?.image !== undefined || pubFlagship?.previewFigure !== undefined, "Public flagship has authentic logo/preview present");

const privFlagship = getProject("rpoms", true);
assert(Boolean(privFlagship), "getProject resolves original slug 'rpoms' when authorized");
assert(privFlagship?.name === "RPOMS", "Authorized flagship preserves original name RPOMS");
assert(privFlagship?.image !== undefined || privFlagship?.previewFigure !== undefined, "Authorized flagship has original visual present");

// 2. Blog Posts Verification
console.log("\n2. Verifying All 173 Blog Articles...");
const publicPosts = publishedPosts(false);
assert(publicPosts.length === 173, `All 173 blog posts are loaded and published (found ${publicPosts.length})`);

let leakedPosts = 0;
for (const post of publicPosts) {
  const json = JSON.stringify(post);
  if (/Blue Bee Technologies/i.test(json) || /\bBBTech\b/i.test(json) || /\bMaxis\b/i.test(json)) {
    leakedPosts++;
    console.error(`Leak detected in post: ${post.slug}`);
  }
}
assert(leakedPosts === 0, `All 173 public blog posts have 0 business leaks (Blue Bee/BBTech/Maxis)`);

// Check hardware article context-awareness
const hwArticle = getPost("lan-serial-number-extraction-across-router-vendors", false);
assert(Boolean(hwArticle), "Hardware protocol article exists");
if (hwArticle) {
  const hwJson = JSON.stringify(hwArticle);
  assert(/Huawei/i.test(hwJson) || /Kaon/i.test(hwJson) || /TP-Link/i.test(hwJson), 
    "Hardware protocol article preserves generic vendor technical references (Huawei/Kaon/TP-Link)");
  assert(!/Blue Bee Technologies/i.test(hwJson), "Hardware protocol article strips confidential business relationship");
}

// 3. Experience Verification
console.log("\n3. Verifying Professional Experience...");
const pubExp = getExperience(false);
const privExp = getExperience(true);
assert(pubExp.length === privExp.length, "Experience entry count matches");
for (const exp of pubExp) {
  assert(!/Blue Bee Technologies/i.test(exp.org), `Public experience entry [${exp.period}] strips Blue Bee Technologies`);
  assert(!/Maxis/i.test(JSON.stringify(exp)), `Public experience entry [${exp.period}] strips Maxis`);
}
assert(/Blue Bee Technologies/i.test(privExp[0].org), "Authorized experience preserves Blue Bee Technologies");

// 4. Protected Media Security
console.log("\n4. Verifying Protected Media Isolation...");
const publicMediaDir = path.join(process.cwd(), "public");
const privateMediaDir = path.join(process.cwd(), "private", "media");

const rpomsScreenshotInPublic = fs.existsSync(path.join(publicMediaDir, "work", "rpoms"));
assert(!rpomsScreenshotInPublic, "No unredacted rpoms media directory exists in public/");

// private/media is git-ignored: it exists only on the owner's machine, never
// in a clean checkout (CI) or a Git-based deployment. Check it where present.
if (fs.existsSync(privateMediaDir)) {
  const rpomsScreenshotInPrivate = fs.existsSync(path.join(privateMediaDir, "rpoms", "dashboard-overview.png"));
  assert(rpomsScreenshotInPrivate, "Original RPOMS dashboard screenshot exists in private/media/rpoms/dashboard-overview.png");
} else {
  console.log("  [SKIP] private/media not present (git-ignored; expected in CI and deployments)");
}

// 5. Slug Translation & Redirection
console.log("\n5. Verifying Slug Mappings...");
assert(getPublicSlug("rpoms") === "rpoms", "getPublicSlug preserves authentic 'rpoms'");
assert(getOriginalSlug("enterprise-device-operations") === "rpoms", "getOriginalSlug maps alias 'enterprise-device-operations' -> 'rpoms'");
assert(getPublicSlug("non-existent") === "non-existent", "getPublicSlug passes unmapped slugs unchanged");

console.log("\n==================================================");
console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log("==================================================");

if (failed > 0) {
  process.exit(1);
}
