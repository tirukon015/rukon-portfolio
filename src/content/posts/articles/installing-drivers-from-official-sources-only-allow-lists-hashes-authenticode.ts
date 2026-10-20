import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "installing-drivers-from-official-sources-only-allow-lists-hashes-authenticode",
  title: "Installing Drivers From Official Sources Only: Allow-Lists, Catalogue Hashes and Authenticode",
  description:
    "How the BBTech Laptop Inspection Tool finds, downloads, installs and verifies a driver for a refurbished laptop without ever running an unsigned or unofficial package, and why its status vocabulary has no word for a success it did not confirm.",
  date: "2026-10-20",
  category: "Building Real Systems",
  tags: ["Windows", "Drivers", "Python", "PySide6", "Authenticode", "Supply Chain Security", "Refurbishment"],
  contentType: "Technical Guide",
  searchIntent: "problem-aware",
  seoTitle: "Official-Source Driver Installation on Windows: Allow-List, Catalogue Hash and Authenticode Checks",
  relatedProjects: ["bbtech-laptop-inspection-tool", "bbtech-laptop-tool"],
  relatedPosts: [
    "hardware-identity-vs-generated-stock-prefixes-refurbishment",
    "excluding-damaged-monitor-strip-windows-appbar-api",
    "lan-serial-number-extraction-across-router-vendors",
  ],
  sections: [
    {
      heading: "The driver step on a refurbishment line",
      body: [
        "A refurbished laptop leaves the line with Windows reinstalled, and the step that used to depend on a technician's memory was drivers: which device is missing one, which is running on Microsoft's generic driver, where the right package lives, and whether the install actually took. Searching the web for a driver by name is how a line ends up installing a wrapper from a download site. The [BBTech Laptop Inspection Tool](/work/bbtech-laptop-inspection-tool) was built so that the only drivers it installs automatically come from the laptop manufacturer, the hardware manufacturer or Microsoft, and so that it never reports a success it did not see.",
        "It is an inspection tool first. One read-only PowerShell and WMI pass, about six to twelve seconds without administrator rights, collects every Plug and Play device with its hardware and compatible IDs, problem code and bound driver. A status rule turns that into a vocabulary: Code 28 is driver missing, codes 22, 29 and 32 are disabled, any other problem code is a driver error with Microsoft's description shown, a GPU on Microsoft Basic Display Adapter is missing, a touchpad on the PS/2 mouse driver is generic, and a device with no problem code and no driver bound is unknown, never a false missing.",
      ],
    },
    {
      heading: "Resolution: hardware IDs against official catalogues",
      body: [
        "The search never uses generic text like Wi-Fi driver when a hardware ID exists. Three manufacturers publish machine-readable catalogues that their own update tools use, and the resolver parses those: Lenovo's System Update catalogue, which lists PnP IDs, the expected driver version per hardware ID, a SHA-256 and the silent install command; Dell's Command Update catalogue, with PCI vendor and device IDs per system, MD5 and size; and HP's Image Assistant reference, mapping device IDs to SoftPaqs with URL, SHA-256 and silent switches. Windows Update is queried through the Windows Update Agent API, which only returns drivers applicable to this PC.",
        "Manufacturers without a stable catalogue, Acer, ASUS, MSI, Intel, AMD and NVIDIA among them, are not scraped and no API is invented for them; the tool opens their official page instead. Candidates are ranked by official source first with firmware last, then by match quality from exact hardware ID down to a mere model match, then laptop manufacturer over Microsoft over hardware manufacturer, then auto-installable before newest. A device is marked update available only when an official candidate's expected installed version for that specific hardware ID is newer than what is installed; an unknown target version is never reported as an update. Catalogue XML that declares a DTD or entities is rejected before parsing.",
      ],
    },
    {
      heading: "Download: every redirect re-checked",
      body: [
        "A download passes a URL check before a byte moves: HTTPS only, a host on the official allow-list, no credentials embedded in the URL, and the allow-list is applied again on every redirect so a catalogue link that bounces through an unofficial host is refused. The file streams with progress and a cancel, then its SHA-256 or MD5 and size are compared with the catalogue; a mismatch deletes the file and reports download failed. Failures are classified, no internet, server unavailable, URL expired, interrupted, and each offers retry, open the official source, or skip.",
        {
          type: "list",
          items: [
            "Packages are saved under the technician's chosen download folder as manufacturer, category, package; an identical file is reused and a different one never overwritten.",
            "The USB the tool ships on is not a driver repository: nothing is bundled, and downloaded packages are never deleted by the tool or its uninstaller.",
            "Without internet, inspection and reports still work, and official links are still listed.",
          ],
        },
      ],
    },
    {
      heading: "Install and verify: no false success",
      body: [
        "Installation has preconditions: administrator rights, an official source, not firmware, and a valid Authenticode signature. For an INF package that means its catalogue files; a package with no .cat file is unsigned and is blocked. Commands outside the package are refused, archives are checked for zip-slip paths, and the install method follows the package: pnputil for INF packages, the vendor's documented silent switches, MSI, or the Windows Update API. Exit codes are mapped as they are: 0 is installed, 3010 is restart pending, anything else is a failure with the code shown.",
        "Verification is a fresh re-query of the device, not a reading of the installer's output. It reports verified, still broken, wrong version, device gone or restart pending, and only verified counts. The rule runs through the whole tool: Installed only when Windows or the installer confirms it, Verified only after a fresh check passes every condition, and a driver result is never presented as a hardware test, because BBTech tests hardware in a separate process.",
        {
          type: "callout",
          label: "Tested without touching Windows",
          text: "98 automated tests cover the allow-list (spoofed domains, HTTP, credentials, unofficial redirects), hash and size mismatches, 404 and 503 and interrupted downloads, unsigned and firmware refusals, exit-code mapping and the end-to-end find, download, install, verify workflow. Every test uses an isolated data folder, and none installs a driver. A test mode with six scenarios shows an orange simulated-data banner on every screen and in every report.",
        },
      ],
    },
  ],
};
