import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "what-a-dedicated-inference-server-will-and-wont-fix",
  title: "What Moving Self-Hosted Inference to a Server Will and Won't Fix",
  description:
    "A migration plan, not a result: why moving RPOMS AI's model from a laptop to a dedicated server would improve availability but not accuracy, and the gates it must pass first.",
  date: "2026-12-28",
  category: "AI & Automation",
  tags: ["Self-hosted AI", "Ollama", "Infrastructure", "Planning", "Inference", "Benchmarking"],
  contentType: "Problem/Solution",
  searchIntent: "informational",
  seoTitle: "Self-Hosted LLM Inference: Plan Before Buying Hardware",
  relatedProjects: ["rpoms-ai"],
  relatedPosts: [
    "running-qwen2-5-vl-7b-on-intel-iris-xe-with-ollama-vulkan",
    "capping-image-size-for-a-vision-model-inside-a-60-second-limit",
    "exposing-local-ollama-to-vercel-through-a-token-gateway",
    "vercel-or-a-self-hosted-ubuntu-server-choosing-per-app",
  ],
  sections: [
    {
      heading: "The pull toward new hardware",
      body: [
        "This is for anyone running a model on a stopgap machine and feeling the pull toward \"proper\" hardware. [RPOMS AI](/work/rpoms-ai) runs its vision model, Qwen2.5-VL 7B under Ollama, on a Windows laptop with integrated graphics. The site on Vercel reaches it through a [token gateway and a quick tunnel](/blog/exposing-local-ollama-to-vercel-through-a-token-gateway). The intended permanent host is a dedicated server: an 8th-generation Core i5 with 32 GB of RAM, running Ubuntu Server, used for inference only.",
        "To be explicit: this article is a plan. The migration has not started, and by the project's own readiness gates it is not ready to start. It is worth writing down anyway, because thinking it through changed what the move is expected to achieve.",
      ],
    },
    {
      heading: "What the move would improve: availability",
      body: [
        "The laptop has real availability problems. It must be awake with the launcher running. It is also used as a workstation. Its quick tunnel gets a new address on every restart, which then has to be pasted into Vercel. A machine that is always on, does nothing else, and holds a stable named tunnel fixes all of that.",
        {
          type: "code",
          lang: "text",
          code: `CURRENT  Vercel -> Cloudflare quick tunnel -> Windows laptop -> gateway -> Ollama -> Qwen2.5-VL -> rules
FUTURE   Vercel -> secure tunnel/gateway   -> Ubuntu server  -> gateway -> Ollama -> Qwen2.5-VL -> rules`,
          caption: "Only the machine changes. The gateway, rules, qualification and model registry are the same code on either host.",
        },
      ],
    },
    {
      heading: "What it would not improve: accuracy",
      body: [
        "The model, the prompt and the rules would be identical, so what the model sees would be identical. Accuracy is the main problem today. On the thirteen reference photos the model's raw observations give 3 correct verdicts and 6 false accepts, and only the qualification gate keeps that from reaching anyone. Moving hosts is not a fix for \"too many photos come back check manually\". Saying so up front stops a hardware purchase from being sold internally as a quality improvement.",
      ],
    },
    {
      heading: "Speed cannot be predicted, only measured",
      body: [
        "On the laptop, a new photo takes a median of 41 seconds, and the integrated GPU is the bottleneck. It was more than half busy in 198 of 200 sampled seconds, while the CPU averaged 48%. With the GPU disabled the same photo took 119 seconds. The details are in [Running Qwen2.5-VL 7B on an Intel Iris Xe](/blog/running-qwen2-5-vl-7b-on-intel-iris-xe-with-ollama-vulkan).",
        "So the server's speed depends mostly on whether Ollama can use its graphics at all, and on how fast its CPU is if not. Neither can be read off the laptop, and the plan deliberately gives no estimate. That matters because of a hard limit. The public check is one synchronous request inside a 60-second function, with 50 seconds allowed for the model. A host that needs longer than that per new photo would answer \"AI unavailable\" for every real inspection, however accurate it was. The [896 px cap](/blog/capping-image-size-for-a-vision-model-inside-a-60-second-limit) exists for the same reason.",
      ],
    },
    {
      heading: "Four gates before migrating",
      body: [
        {
          type: "list",
          ordered: true,
          items: [
            "The pipeline is correct on real photos. The 896 px cap is deployed and a full-size phone photo is analysed within the timeout in production.",
            "There are real, verified photos to evaluate on. The thirteen references are low-resolution extracts from a spreadsheet, not enough to judge hardware or models.",
            "The server is benchmarked with the same tools on the same photos and meets the latency requirement: a new photo end to end in under 50 seconds, including one with a long answer.",
            "The model is re-qualified on the server. The same model and prompt produced different results on an Apple M4 and on the laptop's Vulkan backend, so a qualification does not transfer between machines.",
          ],
        },
        "The documented status is that gates 1 and 2 are not met and gate 3 has not been attempted. No GPU is to be bought before the server has been benchmarked.",
      ],
    },
    {
      heading: "If the server turns out too slow",
      body: [
        "The options are ranked by cost, and the decision is to be made after measuring.",
        {
          type: "table",
          head: ["Option", "What it buys", "What it costs"],
          rows: [
            ["Make the check asynchronous", "Removes the 60-second ceiling. Speed becomes waiting, not failure", "A queue, a status endpoint, and a polling page"],
            ["A smaller model", "Faster inference", "Full re-qualification. It may be worse, and the 3B Qwen2.5-VL is under a non-commercial licence"],
            ["Add a GPU", "Raw speed", "Money, justified only by a measured requirement"],
          ],
        },
        "The first option is the interesting one. It is the only change that makes the host's speed irrelevant to correctness. Whether to self-host at all is a related decision, discussed for other apps in [Vercel or a Self-Hosted Ubuntu Server](/blog/vercel-or-a-self-hosted-ubuntu-server-choosing-per-app).",
        "The laptop stays as the fallback until the server passes all four gates. Switching back is an environment variable change and a redeploy. The budget today is zero: Ollama is MIT licensed, Qwen2.5-VL 7B and cloudflared are Apache-2.0, and a named Cloudflare tunnel is free with a domain on Cloudflare. RPOMS AI has no model active in production and has never been used on real line photos. Everything above is preparation for when it is.",
      ],
    },
  ],
  related: [{ label: "RPOMS AI project", href: "/work/rpoms-ai" }],
};
