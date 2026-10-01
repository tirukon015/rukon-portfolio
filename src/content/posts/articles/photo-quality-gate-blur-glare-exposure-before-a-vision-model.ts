import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "photo-quality-gate-blur-glare-exposure-before-a-vision-model",
  title: "A Photo Quality Gate That Runs Before the Vision Model: Blur, Exposure and Glare From Raw Pixels",
  description:
    "How RPOMS AI rejects blurred, dark, over-exposed and glare-filled photos with plain pixel arithmetic before any model is called, and how the thresholds were calibrated.",
  date: "2026-10-01",
  category: "AI & Automation",
  tags: ["Computer Vision", "Image Quality", "Blur Detection", "TypeScript", "Laplacian", "Vision Models"],
  contentType: "Technical Guide",
  searchIntent: "problem-aware",
  seoTitle: "Image Quality Gate Before a Vision Model",
  relatedProjects: ["rpoms-ai"],
  relatedPosts: [
    "a-vision-model-that-only-observes",
    "capping-image-size-for-a-vision-model-inside-a-60-second-limit",
    "hardening-a-public-photo-upload-exif-magic-bytes-and-re-encoding",
    "four-kinds-of-unclear-decision-states-for-an-ai-check",
  ],
  sections: [
    {
      heading: "Why a bad photo has to be stopped before the model sees it",
      body: [
        "This is for anyone putting a vision model behind a photo upload: a person takes a picture, a model describes it, and something downstream acts on the description. The model will describe whatever it is given. A blurred smear or a glare-streaked frame still gets a description, and the description can sound confident.",
        "[RPOMS AI](/work/rpoms-ai) inspects the cosmetic condition of refurbished routers from a single photo of the casing. The casings are glossy black plastic. In my commit notes for the gate I wrote the rationale down: under bright lighting, specular streaks on that plastic look exactly like scratches, and a model handed that photo will confidently describe damage that is not there. A better model does not fix that. Rejecting the photo does.",
        "So the pipeline's first step is a quality gate that uses no model at all. If a photo fails it, the answer is a retake request with a specific reason, and no inference is run. The wider design, where the model only observes and rules decide, is described in [A Vision Model That Only Observes](/blog/a-vision-model-that-only-observes). This article is about the gate at the front.",
        {
          type: "flow",
          steps: ["Photo", "Decode", "Surface measurements", "Quality gate", "Vision model (only if usable)", "Rules"],
          caption: "If the quality gate fails, the pipeline records no analysis and the decision engine answers \"retake photo\".",
        },
      ],
    },
    {
      heading: "Four measurements from plain pixel arithmetic",
      body: [
        "The gate downscales the decoded image to 512 pixels on the long edge, converts it to luma and measures a handful of numbers. Everything is plain typed-array arithmetic: no native modules and no WebAssembly. The same code therefore runs in a Vercel function, in Vitest and in the evaluation script.",
        "Sharpness is the variance of a 4-neighbour Laplacian. A sharp image has strong local second derivatives at edges, so the response varies a lot. A blurred one is smooth, so the variance collapses. Brightness is the mean luma of the frame. Over-exposure is the fraction of pixels above 250, meaning blown out. The short edge of the original image is recorded as well, because some resolution is simply too low to show surface detail.",
        {
          type: "code",
          lang: "ts",
          code: `for (let y = 1; y < h - 1; y++) {
  for (let x = 1; x < w - 1; x++) {
    const i = y * w + x;
    const lap = -4 * L[i] + L[i - 1] + L[i + 1] + L[i - w] + L[i + w];
    s += lap;
    s2 += lap * lap;
    k++;
  }
}
const mean = k ? s / k : 0;
const sharpness = k ? Math.max(0, s2 / k - mean * mean) : 0;`,
          caption: "Variance of the Laplacian at the fixed 512 px working size, from src/lib/analysis/quality.ts.",
        },
        "The fixed working size matters. Laplacian variance depends on scale, so measuring at whatever size arrived would make one threshold mean different things for different photos. Downscaling first also keeps the cost fixed. The raster toolkit computes box sums from an integral image, so each operation costs O(pixels) regardless of radius.",
      ],
    },
    {
      heading: "Glare, coverage and obstruction need the object first",
      body: [
        "Whole-frame numbers cannot tell you that glare is sitting on the part you care about. A separate surface-analysis step finds the device first: the dominant dark, colourless region, from an Otsu threshold on luma capped at 110 plus a chroma limit, cleaned up with morphology. From that mask it reports three more numbers.",
        {
          type: "list",
          items: [
            "Device coverage: how much of the frame the device occupies.",
            "Inspectable fraction: how much of the device's plain surface is left after excluding the silhouette edge, vent grids (dense dark holes) and printed logos (dense very bright ink). Highlights between vent holes and white print both look exactly like marks.",
            "Surface glare: the fraction of the device area brighter than 235 luma inside that inspectable interior.",
          ],
        },
        "The gate uses these only when a device is actually present. If coverage is below 6% of the frame, the only issue raised is `no_device`. Otherwise it goes on to check whether the device is too small to inspect (below 15%), whether glare exceeds 12% of the surface, and whether less than 12% of the surface is inspectable.",
      ],
    },
    {
      heading: "The thresholds, and where they came from",
      body: [
        {
          type: "table",
          head: ["Check", "Threshold", "Issue raised"],
          rows: [
            ["Short edge", "under 320 px", "too_small"],
            ["Laplacian variance", "under 40", "blur"],
            ["Mean luma", "under 35", "too_dark"],
            ["Mean luma or blown-out fraction", "over 215, or over 25% of pixels above 250", "too_bright"],
            ["Device coverage", "under 6%", "no_device"],
            ["Device coverage", "under 15%", "too_far"],
            ["Surface glare", "over 12% of the device", "glare"],
            ["Inspectable fraction", "under 12%", "obstructed"],
          ],
          caption: "QUALITY_THRESHOLDS, versioned as quality-1.0.0. These limit photo quality. They are not acceptance criteria.",
        },
        "The first version of the gate had these thresholds set to null, with resolution as the only rule enforced. My reasoning is in the commit message: a guessed threshold that rejects good photos teaches the people taking them to fight the gate, and one that accepts bad photos quietly poisons everything downstream.",
        "They were then calibrated on real material. The programme's written criteria come with thirteen handheld reference photos. Every one of them must pass the gate, while blurred, darkened, over-exposed and device-less copies of the same photos must fail, each for the right reason. `quality.test.ts` builds those degraded copies from the originals (a box blur, a brightness map, a solid frame) and re-checks both halves on every change. If a threshold tweak breaks either half, the suite fails.",
        {
          type: "callout",
          label: "Calibration has limits",
          text: "Thirteen photos is a small calibration set, and none of them came from the actual inspection station. The gate is tuned to reject what is clearly unusable. It is not tuned to find the best photo. Recalibrating against real station photos is still open work.",
        },
      ],
    },
    {
      heading: "What the gate caught",
      body: [
        "The repeatable evaluation on 22 September 2026 included four degraded controls, each with the expectation \"must not be accepted\". Glare was painted over the scratches of a rejected reference. A second rejected reference was heavily blurred until its scratch disappeared. An accepted reference was cut to 7% brightness. The fourth was a blank frame with no router in it. All four were stopped by the quality gate as PHOTO_QUALITY_FAILED before reaching the model.",
        "Each failure also produces plain retake advice. `QUALITY_ISSUE_TEXT` maps every issue to a sentence a member of the public can act on, such as \"The router is too small in the frame, move closer\" or \"Strong glare is hiding part of the surface\". A retake request that names the problem gets a better second photo than a generic error does.",
      ],
    },
    {
      heading: "The same pixels, used for a different job",
      body: [
        "The surface step also reports bright residual marks on the plain surface. It was tempting to use them as a cheap defect detector. I scored them against the regions circled on the thirteen references, and only about one detected mark in five fell inside a circle. That is good enough to measure photo quality and to show an administrator where the surface was bright. It is nowhere near good enough to accept or reject a unit, so the decision engine never reads them.",
        "That is the general lesson I would take from this gate. Deterministic image measurements are reliable at answering \"can anyone judge this photo?\" and unreliable at \"what is wrong with this object?\". Keep them on the first question, and the model is only ever asked about photos worth asking about.",
      ],
    },
  ],
  related: [
    { label: "RPOMS AI project", href: "/work/rpoms-ai" },
    { label: "A Vision Model That Only Observes", href: "/blog/a-vision-model-that-only-observes" },
  ],
};
