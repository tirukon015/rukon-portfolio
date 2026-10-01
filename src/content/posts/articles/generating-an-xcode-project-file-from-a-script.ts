import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "generating-an-xcode-project-file-from-a-script",
  title: "Generating an Xcode Project File From a Script, With Stable IDs",
  description:
    "Both of my iOS apps write project.pbxproj from a script. How the object IDs are made, why hashing names beats a counter, and what it costs.",
  date: "2026-10-02",
  category: "Developer Journey",
  tags: ["Xcode", "pbxproj", "Python", "Node.js", "iOS", "Build Tooling"],
  contentType: "Technical Guide",
  searchIntent: "problem-aware",
  seoTitle: "Generate Xcode project.pbxproj From a Script",
  relatedProjects: ["spendrop", "drivekeep"],
  relatedPosts: [
    "ios-share-extension-ocr-shared-swiftdata-store",
    "in-app-test-runner-and-xcuitest-for-an-ios-app",
    "app-group-swiftdata-store-was-never-the-one-in-use",
  ],
  sections: [
    {
      heading: "The file nobody wants to merge",
      body: [
        "An Xcode project lives in `project.pbxproj`, a large property-list file in which every file reference, build file, group, build phase and target is an object keyed by a 24-character hexadecimal ID. Xcode generates those IDs randomly and rewrites the file whenever you add a file. The result is a file that is hard to review, painful to merge, and easy to break by hand.",
        "For [SpenDrop](/work/spendrop) and [DriveKeep](/work/drivekeep) I did not edit it in Xcode at all. Each repository has a script that writes the whole file from a list of sources: `scripts/generate_xcodeproj.py` in SpenDrop and `scripts/generate-pbxproj.js` in DriveKeep. This note covers how they generate IDs, why one approach is better than the other, and the costs. It is for iOS developers who want a reviewable project file without adopting a full project-generation tool.",
      ],
    },
    {
      heading: "IDs from a hash of the object's name",
      body: [
        "SpenDrop's generator derives every ID from a SHA-1 hash of a descriptive name for the object:",
        {
          type: "code",
          lang: "python",
          code: `import hashlib

def gen_id(name):
    # Generates a stable 24-character hexadecimal Xcode identifier
    h = hashlib.sha1(name.encode('utf-8')).hexdigest().upper()
    return h[:24]

target_id       = gen_id("SpenDrop_NativeTarget")
share_target_id = gen_id("SpenDropShare_NativeTarget")

# One build file per source per target, so the same Swift file can be
# compiled into both the app and the Share Extension.
share_build_files = {path: gen_id(f"BF_SHARE_{path}") for path in share_source_paths}`,
          caption: "From SpenDrop's scripts/generate_xcodeproj.py (the last line is condensed from a loop).",
        },
        "Because an ID depends only on its object's name, regenerating the project after adding one file changes only the lines that involve that file. Everything else is byte-for-byte identical, so the diff in a pull request shows what actually changed.",
      ],
    },
    {
      heading: "IDs from a counter: deterministic, but fragile",
      body: [
        "DriveKeep's generator uses a counter with a short prefix:",
        {
          type: "code",
          lang: "js",
          code: `let idCounter = 1;
function genId(prefix = 'DK') {
  const hex = (idCounter++).toString(16).padStart(20, '0');
  const code = Buffer.from(prefix).toString('hex').slice(0, 4);
  return (code + hex).toUpperCase();
}`,
          caption: "From DriveKeep's scripts/generate-pbxproj.js.",
        },
        "That is deterministic, since the same file list always gives the same IDs, but it is not stable. Insert one file early in the list and every ID after it shifts, so the regenerated file differs almost everywhere. Hashing a name avoids that; if I were consolidating the two, the counter would go.",
      ],
    },
    {
      heading: "Target membership becomes explicit, which cuts both ways",
      body: [
        "SpenDrop has three targets: the app, the Share Extension and the UI tests. The extension shares no framework with the app; instead, the model, data and OCR sources it needs are listed explicitly in the generator's `share_source_paths` and compiled into both targets. That makes membership reviewable: the list is a plain array in a script, not a set of checkboxes in Xcode's inspector.",
        "It also makes membership a list someone has to maintain. One commit in SpenDrop's history exists only to fix a sample-data file missing from the extension target, and in DriveKeep a commit adds new service and settings sources to the generator's list. A source added to the folder but not to the script is simply not compiled.",
      ],
    },
    {
      heading: "Drift with Xcode",
      body: [
        "The script is the documented source of truth for target membership, but Xcode does not know that. SpenDrop's documentation records that Xcode 27 later re-saved the project file, leaving an uncommitted difference, so the checked-in project and the script's output can drift; it also notes that the committed schemes reference an older target ID, although builds still work. Opening the project in Xcode is fine; changing settings there and not in the script quietly forks the two.",
        {
          type: "callout",
          label: "Verification",
          text: "SpenDrop's app, Share Extension and UI-test target all build on the iOS 27 simulator from this project (29 September 2026). DriveKeep's iOS app has not been built for the project's audit, which ran on Windows; its commit messages record successful builds at the time of those commits.",
        },
        "The Share Extension that depends on that shared source list is described in [Building an iOS Share Extension That Reads a Screenshot](/blog/ios-share-extension-ocr-shared-swiftdata-store).",
      ],
    },
  ],
};
