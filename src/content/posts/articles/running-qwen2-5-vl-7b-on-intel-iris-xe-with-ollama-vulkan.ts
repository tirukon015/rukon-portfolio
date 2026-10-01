import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "running-qwen2-5-vl-7b-on-intel-iris-xe-with-ollama-vulkan",
  title: "Running Qwen2.5-VL 7B on an Intel Iris Xe With Ollama and Vulkan: 119 s to 41 s",
  description:
    "Setting up a 7B vision model on a Windows laptop with no discrete GPU: enabling the Iris Xe under Ollama, where the time actually goes, and what the GPU profile showed.",
  date: "2026-10-02",
  category: "AI & Automation",
  tags: ["Ollama", "Qwen2.5-VL", "Intel Iris Xe", "Vulkan", "Windows", "Self-hosted AI"],
  contentType: "Technical Guide",
  searchIntent: "problem-aware",
  seoTitle: "Qwen2.5-VL on Intel Iris Xe via Ollama Vulkan",
  relatedProjects: ["rpoms-ai"],
  relatedPosts: [
    "benchmarking-ollama-vision-models-the-cached-image-trap",
    "capping-image-size-for-a-vision-model-inside-a-60-second-limit",
    "exposing-local-ollama-to-vercel-through-a-token-gateway",
    "a-vision-model-that-only-observes",
  ],
  sections: [
    {
      heading: "The constraint: a 7B vision model and no discrete GPU",
      body: [
        "This is for anyone trying to run an open vision-language model on an ordinary laptop, specifically one with Intel integrated graphics and no NVIDIA card. The project was [RPOMS AI](/work/rpoms-ai), a router-casing inspection tool whose rule is that the mandatory AI cost is zero: no paid API and no rented GPU. The model is Qwen2.5-VL 7B, which is Apache-2.0 licensed, served by Ollama. It runs on a machine we control and is called from the website over a tunnel.",
        "The temporary inference host was a Windows laptop with an Intel Core i5-1145G7, Intel Iris Xe graphics and 32 GB of RAM. The first measurement, on 20 September 2026, was 119 seconds for one photo. That was because the model was running entirely on the CPU.",
      ],
    },
    {
      heading: "Setup on Windows, without admin rights",
      body: [
        "Ollama and cloudflared both install per user through winget. The model is about 6 GB.",
        {
          type: "code",
          lang: "bash",
          code: `winget install --id Ollama.Ollama --scope user
winget install --id Cloudflare.cloudflared
ollama pull qwen2.5vl:7b`,
        },
        "Then comes the setting that matters most on this hardware. On this machine Ollama did not use the integrated GPU by default, which left the whole 7B model on the i5 CPU. One environment variable changes that:",
        {
          type: "code",
          lang: "bash",
          code: `OLLAMA_IGPU_ENABLE=1`,
          caption: "Set at user scope on the machine, and also passed explicitly to the Ollama process the project's launcher starts.",
        },
        "With it set, Ollama runs the model on the Iris Xe through its Vulkan backend. The project's `npm run inference` command starts Ollama with this variable if Ollama is not already running, then starts the token gateway and the tunnel. So a restart does not depend on remembering it.",
      ],
    },
    {
      heading: "What 41 seconds is made of",
      body: [
        "These figures were measured on 22 September 2026 with the production prompt, using a dedicated benchmark with nothing else running. Every figure is for a photo the model had not seen before, because every real inspection is a new photo.",
        {
          type: "table",
          head: ["Stage", "Time"],
          rows: [
            ["Loading the model after it was unloaded", "6.2 s"],
            ["Encoding the image", "26.5 to 29.5 s (mean 27.7 s)"],
            ["Generating the answer", "4.9 to 5.7 tokens per second"],
            ["One new photo, end to end", "median 41 s, range 38 to 82 s"],
            ["CPU only, iGPU disabled (20 September)", "119 s"],
          ],
        },
        "The surprise was the split. Encoding the image, meaning the vision encoder turning pixels into tokens the language model can attend to, costs about 28 seconds and is fixed for a given image size. Generating the JSON answer is comparatively cheap, but it is not fixed: it grows with the length of the answer. The model sometimes lists the same kind of defect several times instead of once with a count. One photo whose answer named \"scratch\" eight separate times took 82 seconds. The more damaged the router, the longer the answer, and the more likely it is to run past a timeout.",
      ],
    },
    {
      heading: "The GPU profile: the iGPU is the bottleneck",
      body: [
        "I sampled utilisation every second across a run of ten photos. The integrated GPU was more than 50% busy in 198 of 200 seconds, with a mean of 96%, while the CPU averaged 48%. The llama-server process held about 7.1 GB of RAM, peaking at 7.4 GB.",
        "That profile answers the question of what to upgrade. Faster RAM or a better CPU would barely move the number, because the work is on the GPU and the GPU is saturated. It also means you cannot estimate a different machine's speed from this one. Whether its graphics can be used at all decides most of the answer, and that has to be measured on the machine itself.",
      ],
    },
    {
      heading: "Settings on the request side",
      body: [
        "The provider sends every analysis with the same options. Temperature 0 and a fixed seed make the output reproducible: the thirteen reference verdicts from a 22 September evaluation matched the 20 September run exactly. A JSON Schema passed as `format` constrains the output, and the application validates it again with Zod regardless.",
        {
          type: "code",
          lang: "ts",
          code: `{
  model: "qwen2.5vl:7b",
  stream: false,
  think: false,
  format: VISION_JSON_SCHEMA,
  keep_alive: "30m",
  options: { temperature: 0, seed: 1, num_predict: 500 },
  messages: [{ role: "user", content: VISION_PROMPT, images: [base64Jpeg] }],
}`,
          caption: "The body of each /api/chat call, from src/lib/vision/provider.ts (image variable renamed).",
        },
        "`keep_alive: \"30m\"` asks Ollama to keep the model resident for thirty minutes after each call, so a busy period does not pay the 6.2 second load repeatedly. To pin it with no expiry, run `OLLAMA_KEEP_ALIVE=-1 ollama serve`. `num_predict` caps the answer length, which is the one part of the cost the prompt can influence.",
        {
          type: "callout",
          label: "Hardware changes answers, not just speed",
          text: "The same model and the same prompt gave different results on an Apple M4 and on this Vulkan setup across the thirteen references. The differences were small, but real. So a model qualified on one machine has to be re-evaluated on another before it is trusted there.",
        },
      ],
    },
    {
      heading: "What this host can and cannot do",
      body: [
        "Enabling the iGPU made the difference between unusable and borderline. For a web request that must finish inside a 60-second serverless function, a 41-second median leaves little headroom. It only worked once the pipeline stopped sending full-size photos to the model. Before that, a 1600 px phone photo took 114 seconds, and the fix is its own story. The laptop also serves one analysis at a time, must be awake, and changes its quick-tunnel address on every restart.",
        "It was the right choice for a zero-cost testing host. The earlier write-up, [A Vision Model That Only Observes](/blog/a-vision-model-that-only-observes), covers what the model actually scored, and the [development environment article](/blog/building-software-in-cyberjaya-the-development-environment) covers the laptop's other jobs. It is not a production inference server. RPOMS AI has no model active in production and has not been used on real line photos. Moving inference to a dedicated machine is planned but not started.",
      ],
    },
  ],
  related: [
    { label: "RPOMS AI project", href: "/work/rpoms-ai" },
    { label: "A Photo Quality Gate Before the Vision Model", href: "/blog/photo-quality-gate-blur-glare-exposure-before-a-vision-model" },
  ],
};
