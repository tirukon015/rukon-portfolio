import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "freezing-label-templates-with-raster-hash-tests",
  title: "Freezing a Label Design in CI by Hashing Its Rendered Raster",
  description:
    "A Vitest test that hashes each label template's JSON and its exact 1-bit print raster, so any change that would move a single printed dot fails the build and the deploy.",
  date: "2026-10-02",
  category: "Building Real Systems",
  tags: ["Vitest", "Snapshot testing", "Regression testing", "CI", "Label printing", "TypeScript"],
  contentType: "Technical Guide",
  searchIntent: "informational",
  seoTitle: "Freezing Label Templates With Raster Hash Tests",
  relatedProjects: ["rpoms-print-engine"],
  relatedPosts: [
    "rendering-labels-for-a-576-dot-thermal-printhead",
    "testing-pwa-offline-boot-headless-chrome-devtools-protocol",
    "self-hosting-node-postgresql-nginx-systemd-ubuntu",
  ],
  sections: [
    {
      heading: "The requirement: the physical label must not move",
      body: [
        "The [RPOMS Print Engine](/work/rpoms-print-engine) prints router and box labels on a 50 × 30 mm thermal printer. The router label design was settled before the engine existed: it matched the labels already on the line. Every later change, a new template editor, a rewritten renderer, a second label module, came with the same instruction: the printed output must not change.",
        "\"Be careful\" is not a control. A renderer is exactly the kind of code where a refactor that looks harmless, a rounding change, a font loaded differently, a default property added, moves a barcode one dot to the right. Nobody sees that in a code review. So the instruction became a test. This article describes it, for anyone who needs a pixel-exact guarantee on generated output, labels or otherwise.",
      ],
    },
    {
      heading: "What the test hashes",
      body: [
        "For every built-in template, the test renders the template with its own stored sample data through the real renderer, then records four things:",
        {
          type: "table",
          head: ["Recorded", "Catches"],
          rows: [
            ["SHA-256 of the template JSON, minus createdAt and updatedAt", "Any edit to the design itself"],
            ["SHA-256 of the print raster bytes", "Any change in what the printer would receive"],
            ["Raster width and height", "A geometry or printhead change, with a clearer message"],
            ["Each element as id:type@x,y w×h", "A moved or resized element, readable in the failure diff"],
          ],
        },
        "The raster hash is the one that matters. It is taken over the final 1-bit bitmap, the exact bytes that are split into row packets and sent over Bluetooth, not over a preview image. That is the only level at which \"the label did not change\" is a precise statement. How that raster is built from a millimetre template is described in [rasterising labels for a 576-dot printhead](/blog/rendering-labels-for-a-576-dot-thermal-printhead).",
        "The other entries exist for the person reading a failure. A bare hash mismatch says something changed. The element list says which element moved, and the JSON hash says whether the template or the renderer is responsible.",
        {
          type: "code",
          lang: "ts",
          code: "for (const t of BUILTIN_TEMPLATES) {\n  const { createdAt: _c, updatedAt: _u, ...rest } = t;\n  const r = await renderTemplate(t, t.sampleData ?? {}, { env });\n  out[t.id] = {\n    json: sha(JSON.stringify(rest)),\n    raster: sha(r.bitmap.data),\n    width: r.bitmap.width,\n    height: r.bitmap.height,\n    elements: t.elements.map((e) => `${e.id}:${e.type}@${e.x},${e.y} ${e.width}×${e.height}`),\n  };\n}",
          caption: "From tests/templateRegression.test.ts.",
        },
        "A second, much plainer test pins the router template's structure by name: exactly five elements, in order logo, rule, model, barcode and serial, with the model text bound to `{{MODEL}}` and both the barcode and the serial text bound to `{{SERIAL}}`. It is redundant with the hash, deliberately. If the baseline is ever regenerated carelessly, this one still fails on the change that matters most, a barcode that no longer encodes the serial.",
      ],
    },
    {
      heading: "Rendering in Node, with the same fonts",
      body: [
        "The test runs in Vitest under Node, not in a browser. The renderer only needs a canvas, so the test passes it an environment built on `@napi-rs/canvas` and registers the same Roboto font files the browser build bundles, so that text metrics match. That is possible because the renderer never touches the DOM directly: it receives its canvas factory and image loader as an injected environment.",
        {
          type: "callout",
          label: "A limit worth stating",
          text: "The hash freezes what the Node canvas produces. The browser's canvas is a different implementation, and it could in principle anti-alias text differently before the threshold. The test guarantees that my code did not change the output; it does not prove that Node and the browser agree dot for dot. The browser side is covered by rendering the frozen template in a real headless browser during the offline test, which checks the label has ink, not that its hash matches.",
        },
      ],
    },
    {
      heading: "Updating the baseline must be a deliberate act",
      body: [
        "The baseline is a JSON file of hashes committed in the repository. If it does not exist, the test writes it and passes. To accept a real design change, you delete the file and rerun. That is intentionally clumsy. It cannot happen as a side effect of updating snapshots in bulk, and the deleted-and-recreated file shows up in the diff.",
        "Two further guards stop a baseline change from sliding through unnoticed:",
        {
          type: "list",
          items: [
            "CI runs `git diff --exit-code` on the baseline file and the `templates/` folder after the test suite. If running the tests changed either, the job fails.",
            "The deploy script runs the freeze test on its own before building the app. A server cannot be updated with a label change that the test rejects.",
          ],
        },
      ],
    },
    {
      heading: "Adding features without moving the frozen labels",
      body: [
        "The freeze shaped how new renderer features were written. When a second label module needed text that wraps after a hyphen or at a space, wrapping became an opt-in property on text elements. Templates that do not set it take the old code path, so the four frozen templates render exactly as before and their hashes did not change. The new module also got its own template store and its own built-in template, outside the frozen list, and importing one of its templates into the router label store is refused.",
        "That new label has its own test in a different style. It reads the QR code back out of the print raster and compares it, module by module, with the encoding of the exact input value. For a label whose content varies, checking that the output decodes to the right data is more useful than freezing one sample.",
      ],
    },
    {
      heading: "One bug the freeze test found in itself",
      body: [
        "On 27 September 2026 the freeze test failed on a Windows machine with no change to any template. The fixture path had been built with `new URL(...).pathname`, which on Windows yields something like `/C:/Users/...` with spaces encoded as `%20`. Node could not open that path, so the test could not find its own baseline. The same mistake was in the database migration runner. The fix was `fileURLToPath` in both places. The hashes were unchanged, and the test now passes on Windows, macOS and Linux.",
        "It is a reminder that a guard test is code too. A freeze test that fails for the wrong reason teaches people to delete the baseline, which is the one thing it exists to prevent.",
      ],
    },
  ],
};
