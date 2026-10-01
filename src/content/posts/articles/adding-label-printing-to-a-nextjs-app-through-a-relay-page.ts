import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "adding-label-printing-to-a-nextjs-app-through-a-relay-page",
  title: "Adding Label Printing to an Existing Next.js App Without Touching the Printer",
  description:
    "The calling side of a print integration: validating SKUs the way the printer app will, passing them in a URL fragment, detecting blocked pop-ups, and refusing to print unsaved changes.",
  date: "2026-11-13",
  category: "Full-Stack Development",
  tags: ["Next.js", "React", "TypeScript", "Label Printing", "window.open", "Integration"],
  contentType: "Technical Guide",
  searchIntent: "problem-aware",
  seoTitle: "Label Printing in a Next.js App via a Relay Page",
  relatedProjects: ["itms", "rpoms-print-engine"],
  relatedPosts: [
    "cross-app-printing-broadcastchannel-web-locks",
    "printing-labels-from-the-browser-over-web-bluetooth",
    "contributing-fixes-to-a-web-app-you-did-not-build",
    "generating-inventory-skus-in-excel-with-let-and-textjoin",
  ],
  sections: [
    {
      heading: "The problem: an inventory app needs labels, and should not own a printer",
      body: [
        "BBTech's inventory system, [ITMS](/work/itms), is a Next.js application built by another BBTech developer. Every device in it has a barcode SKU and a group SKU key, and both go on a QR label printed on a NIIMBOT thermal printer. My manager asked me to solve label printing. I did it by building the [RPOMS Print Engine](/work/rpoms-print-engine), my own independent project, which owns the Bluetooth connection, renders the label and talks to the printer.",
        "That left the other half: adding printing to an application I did not write, with as small a footprint as possible. The engine side, a relay page that hands a request to the open Print Engine tab and reports the printer's real result, is described in [Letting Another Web App Print Through an Open Tab](/blog/cross-app-printing-broadcastchannel-web-locks). This article is about the calling side: a service file, two button components and a few call sites, on a branch of the ITMS repository.",
        {
          type: "callout",
          label: "Status",
          text: "The ITMS integration is on a branch and has not been merged or deployed. Merging it with the system's developer, and validating a full batch on the real printer, are still to do.",
        },
      ],
    },
    {
      heading: "The rule: ITMS builds a link and opens it, nothing more",
      body: [
        "The service file opens with the boundary in a comment: ITMS only builds the relay link and opens it, and Bluetooth, the printer, the label and printing belong to the Print Engine. That one rule decided everything else. ITMS has no printer driver, no Web Bluetooth permission, no label layout and no print queue. If the label design changes, ITMS does not change. And a printing bug cannot break inventory screens, because the most ITMS can do wrong is open the wrong URL.",
        "The engine's address is configuration, with a default and a trailing-slash trim, so the same build can point at a test instance:",
        {
          type: "code",
          lang: "ts",
          code: `const DEFAULT_PRINT_ENGINE_URL = "https://print.rukon.dev";

export const PRINT_ENGINE_URL = (
  process.env.NEXT_PUBLIC_PRINT_ENGINE_URL?.trim() || DEFAULT_PRINT_ENGINE_URL
).replace(/\\/+$/, "");`,
        },
      ],
    },
    {
      heading: "Validate the way the receiver will",
      body: [
        "The Print Engine cleans and checks every value it receives. If ITMS checked differently, a label could pass in ITMS and be refused in the pop-up, which is the worst place for an error. So the service copies the engine's rules exactly: control characters are removed, outer whitespace is trimmed, and each value is limited to the same 256 characters:",
        {
          type: "code",
          lang: "ts",
          code: `export function cleanSku(value: unknown): string {
  if (value === undefined || value === null) return "";
  return String(value).replace(/[\\u0000-\\u001f\\u007f]/g, "").trim();
}

export function validateLabel(barcodeSku: unknown, groupSku: unknown) {
  const barcode = cleanSku(barcodeSku);
  const group = cleanSku(groupSku);
  if (!barcode && !group) return { ok: false, message: "Barcode SKU and Group SKU are missing." };
  if (!barcode) return { ok: false, message: "Barcode SKU is missing." };
  if (!group) return { ok: false, message: "Group SKU is missing." };
  // ...length checks against MAX_SKU_LENGTH (256)
  return { ok: true, skus: { barcodeSku: barcode, groupSku: group } };
}`,
          caption: "From the ITMS print service on the branch.",
        },
        "Each message names the missing field. \"Group SKU is missing\" tells the user to complete the device, where a generic \"cannot print\" would send them to me.",
      ],
    },
    {
      heading: "Put the data in the fragment, and notice blocked pop-ups",
      body: [
        "The relay URL carries both SKUs in the hash, built with URLSearchParams so the values are encoded correctly:",
        {
          type: "code",
          lang: "ts",
          code: "export function buildRelayUrl({ barcodeSku, groupSku }: LabelSkus): string {\n  const params = new URLSearchParams({ barcode_sku: barcodeSku, group_sku: groupSku });\n  return `${PRINT_ENGINE_URL}/bbtech/print.html#${params.toString()}`;\n}\n\nexport function openPrintEngine(url: string, features?: string): boolean {\n  return window.open(url, \"_blank\", features) !== null;\n}",
        },
        "A fragment is never sent to a server, so the SKUs do not end up in server or proxy logs, and the cached relay page can load offline. Both points are explained on the engine side.",
        "The relay opens as a small pop-up (`popup,width=440,height=360`), so the operator sees the printer's answer without leaving ITMS. Pop-ups can be blocked, and a blocked `window.open` returns `null`. Without checking for that, the click would do nothing visible. The button checks it and says so: \"Pop-up blocked: allow pop-ups for this site to print.\" On success it says only \"Label sent to Print Engine.\", deliberately not \"Printed\". ITMS cannot know whether the label printed. The relay window, which follows the job to the printer's own confirmation, is the place that says so.",
      ],
    },
    {
      heading: "Never print what isn't saved",
      body: [
        "On a device's details page and in the device drawer, a user can edit fields that change the SKUs before saving. Printing the edited values would produce a label for a record that does not exist yet, and if they then cancel, a label for a record that never will. So the print button takes the saved SKUs, and a `blockedReason` when the edited ones differ:",
        {
          type: "code",
          lang: "tsx",
          code: `<PrintLabelButton
  barcodeSku={savedDevice?.barcode_sku}
  groupSku={savedDevice?.group_sku_key}
  blockedReason={
    localDevice.barcode_sku !== savedDevice?.barcode_sku ||
    localDevice.group_sku_key !== savedDevice?.group_sku_key
      ? "Save the device before printing: SKU has unsaved changes."
      : null
  }
/>`,
          caption: "Simplified; the real comparison normalises null to an empty string.",
        },
        "Supporting this needed one small change in the drawer's state hook: it already kept the original record to detect unsaved changes, and now it also returns it as `savedDevice`. Reusing state the original developer had already built, rather than adding a parallel copy, kept the change to one line.",
        "The new-device form is the exception, and an open question. There, the group SKU is now computed alongside the barcode SKU from the same stored rule, so a label can be printed before the first save, as the old spreadsheet workflow allowed. The serial in that SKU is a preview of the next number. Whether a preview can diverge from what is finally saved, for example when two people receive units of the same brand at once, is something to settle with the system's developer before merging.",
      ],
    },
    {
      heading: "Placement, and a printer button",
      body: [
        "Print buttons sit on the new-device form, the device details page and the device drawer. The drawer is also used outside the devices section, so the button only appears there on device routes. The devices header gets a Printer button that opens the Print Engine's printers page, because connecting the printer is a one-time step per session, and it should be one click away from where the labels are needed.",
        "The printing work is four focused commits, kept separate from unrelated fixes on the same branch. If the developer rejects any part of it, that part can be dropped without touching the rest. When the application is someone else's, that matters as much as the code. The printer protocol underneath is described in [Printing Labels From the Browser Over Web Bluetooth](/blog/printing-labels-from-the-browser-over-web-bluetooth).",
      ],
    },
  ],
};
