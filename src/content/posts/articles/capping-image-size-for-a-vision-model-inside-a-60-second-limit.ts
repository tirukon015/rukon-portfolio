import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "capping-image-size-for-a-vision-model-inside-a-60-second-limit",
  title: "Why Every Real Photo Timed Out: Capping Vision Input at 896 px to Fit a 60-Second Function",
  description:
    "Full-size phone photos never got an answer from RPOMS AI's vision model. Encoding cost grew faster than pixel count; capping at the evaluated scale took 114 s down to 38 s.",
  date: "2026-10-02",
  category: "AI & Automation",
  tags: ["Vision Models", "Qwen2.5-VL", "Latency", "Vercel Functions", "Image Processing", "Timeouts"],
  contentType: "Problem/Solution",
  searchIntent: "problem-aware",
  seoTitle: "Vision Model Image Size vs a Serverless Timeout",
  relatedProjects: ["rpoms-ai"],
  relatedPosts: [
    "running-qwen2-5-vl-7b-on-intel-iris-xe-with-ollama-vulkan",
    "benchmarking-ollama-vision-models-the-cached-image-trap",
    "photo-quality-gate-blur-glare-exposure-before-a-vision-model",
    "what-a-dedicated-inference-server-will-and-wont-fix",
  ],
  sections: [
    {
      heading: "The bug: every real photo was \"AI unavailable\"",
      body: [
        "This is for anyone calling a vision-language model from a request that has a hard time limit, such as a serverless function. [RPOMS AI](/work/rpoms-ai) runs its public check in a Vercel function with `maxDuration = 60`. Inside that, the model call to a self-hosted Qwen2.5-VL 7B had a 45-second timeout.",
        "Until 22 September 2026 the pipeline passed the uploaded photo to the model as it was. The public page downscales photos in the browser to at most 1600 px on the long edge. A photo that size took about 114 seconds to analyse, so every real full-size phone photo hit the timeout and was answered \"AI unavailable\" without ever being judged.",
        "Nobody noticed because every successful analysis until then had used the thirteen reference images, which were extracted from a spreadsheet and are small. The tests passed, the reference evaluation ran, and the path real users would take had never once succeeded.",
      ],
    },
    {
      heading: "Encoding cost grows faster than pixel count",
      body: [
        "I measured the same content at two sizes on the Windows inference host (Intel Iris Xe via Vulkan):",
        {
          type: "table",
          head: ["Image", "Pixels", "Image tokens", "Encoding", "Total"],
          rows: [
            ["Reference photo as extracted", "356k", "1,454", "27 s", "38 s"],
            ["The same content at 1600 px", "2,366k", "3,421", "97 s", "114 s"],
          ],
        },
        "The token count rose about 2.4 times, but encoding time rose about 3.6 times. On an integrated GPU that is already saturated, image encoding dominates the cost of each request. So the image size is the main latency control you have.",
      ],
    },
    {
      heading: "Choosing 896 px, and why that number",
      body: [
        "The fix caps what the model is shown at 896 px on the long edge. The number was not arbitrary, for three reasons.",
        {
          type: "list",
          items: [
            "It is the scale the model was evaluated at. The thirteen references run from 422 to 921 px on the long edge, and 896 sits just below the largest. Twelve of the thirteen pass through the cap untouched, so the evaluation that qualified the model still describes what the model sees in production.",
            "It is 32 × 28. Qwen2.5-VL works on 28-pixel patches, so the capped edge lands on the token grid.",
            "It fits the time budget. A never-before-seen 1365 × 1600 photo, capped to 764 × 896, produced 1,450 tokens, took 27.2 s to encode and 10.3 s to generate, and finished in 38.2 s.",
          ],
        },
        {
          type: "code",
          lang: "ts",
          code: `export const VISION_MAX_EDGE = 896;

export function encodeForVision(r: Raster, original: Uint8Array) {
  // Within the cap, send the uploaded bytes unchanged: re-encoding would add
  // compression artefacts for nothing and alter an evaluated image.
  if (Math.max(r.width, r.height) <= VISION_MAX_EDGE) {
    return { data: original, width: r.width, height: r.height, resized: false };
  }
  const small = downscale(r, VISION_MAX_EDGE);
  const out = jpeg.encode({ data: small.data, width: small.width, height: small.height }, 92);
  return { data: new Uint8Array(out.data), width: small.width, height: small.height, resized: true };
}`,
          caption: "From src/lib/analysis/encode.ts. A test pins that twelve of the thirteen references reach the model byte for byte.",
        },
        "The byte-for-byte branch matters more than it looks. If every image were re-encoded, even the references would change slightly, and the qualification measured on them would describe a different input. Passing small images through untouched keeps what was evaluated identical to what runs.",
      ],
    },
    {
      heading: "The timeout, and why it cannot simply grow",
      body: [
        "With the cap in place, a new photo takes a median of 41 seconds, and the first photo after the model unloads adds about 6 seconds. A 45-second timeout therefore failed ordinary requests at the edge of the distribution, so it went up to 50 seconds. It cannot go further. The function has 60 seconds in total, and it does database work on both sides of the model call: a rate-limit count before, and saving the check and photo after.",
        "Even at 50 seconds, some photos will not make it. An answer that runs long, such as one photo whose answer listed \"scratch\" eight times and took 82 seconds, still exceeds the limit. It is reported as unavailable. It is not guessed. The most damaged routers are the most likely to hit this. That is written down as a known limit, not hidden.",
      ],
    },
    {
      heading: "What the cap costs",
      body: [
        "It is stated in the code comment and I will repeat it here: a 1600 px photo loses half its linear resolution before the model sees it, and a faint hairline scratch may go with it. The alternative was not a sharper answer. It was no answer.",
        "The fix also solved the time problem without solving accuracy. In the same evaluation, the full-size copy of an accepted reference came back inside the timeout, but the model judged the surface only partly visible, so the answer was \"retake\". Time is now in budget. Whether the model sees well enough is a separate question, covered in [A Vision Model That Only Observes](/blog/a-vision-model-that-only-observes).",
        "Stored photos are handled separately. The copy kept for administrator review is re-encoded at up to 1600 px, so a human reviewer still gets the larger image.",
      ],
    },
    {
      heading: "If the cap is not enough",
      body: [
        "The structural fix would be to stop making inference synchronous: accept the photo, return at once, and let the page poll for a result. That removes the 60-second ceiling entirely, at the cost of a queue and a status endpoint. It is recorded as the first option to consider if a future host turns out slower than this one. It has not been built.",
        "For now, RPOMS AI has no model active in production and has not been used on real line photos, so this fix has been verified on the development host, not under real traffic. The measurement method behind these numbers is in [the cached-image benchmark note](/blog/benchmarking-ollama-vision-models-the-cached-image-trap), and the host itself in [Running Qwen2.5-VL 7B on an Intel Iris Xe](/blog/running-qwen2-5-vl-7b-on-intel-iris-xe-with-ollama-vulkan).",
      ],
    },
  ],
  related: [{ label: "RPOMS AI project", href: "/work/rpoms-ai" }],
};
