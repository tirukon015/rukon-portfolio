import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "benchmarking-ollama-vision-models-the-cached-image-trap",
  title: "The 21-Second Benchmark That Was Wrong: Ollama Reuses an Encoded Image",
  description:
    "A vision-model latency figure that was half the real cost, because the benchmark sent the same image twice. How it was caught, corrected, and what a fair benchmark needs.",
  date: "2026-10-08",
  category: "AI & Automation",
  tags: ["Ollama", "Benchmarking", "Latency", "Vision Models", "Qwen2.5-VL"],
  contentType: "Problem/Solution",
  searchIntent: "problem-aware",
  seoTitle: "Ollama Vision Benchmark: The Cached Image Trap",
  relatedProjects: ["rpoms-ai"],
  relatedPosts: [
    "running-qwen2-5-vl-7b-on-intel-iris-xe-with-ollama-vulkan",
    "capping-image-size-for-a-vision-model-inside-a-60-second-limit",
    "evaluating-a-vision-model-with-only-thirteen-examples",
  ],
  sections: [
    {
      heading: "A number that looked fine and was not",
      body: [
        "This note is for anyone measuring how long a local vision model takes per image, especially under Ollama. The published measurement for [RPOMS AI](/work/rpoms-ai) once said a warm analysis took about 21 seconds on an Intel Iris Xe laptop, and that image processing took 264 milliseconds. Both figures were real readings. Neither described a real inspection.",
        "Both came from sending the same image twice. The first request paid for everything. The second found that Ollama had reused the recently processed prompt, image included, so it skipped about 27 seconds of image encoding and only paid for generation. Every real inspection is a new photo, so no real inspection would ever see the 21-second figure.",
      ],
    },
    {
      heading: "What the honest numbers were",
      body: [
        "A dedicated benchmark on 22 September 2026, with a new photo per request and nothing else running on the machine, gave the figures now in the documentation. The full breakdown is in [Running Qwen2.5-VL 7B on an Intel Iris Xe](/blog/running-qwen2-5-vl-7b-on-intel-iris-xe-with-ollama-vulkan).",
        {
          type: "table",
          head: ["Measurement", "Result"],
          rows: [
            ["Image encoding, new photo", "26.5 to 29.5 s"],
            ["One new photo, end to end", "median 41 s, range 38 to 82 s"],
            ["The same photo sent again", "5 s"],
          ],
        },
        "The last row stays in the table on purpose, labelled as a cache hit. It is a useful number to know. If a benchmark result lands near it, the benchmark is probably measuring the cache.",
      ],
    },
    {
      heading: "The same trap inside an evaluation run",
      body: [
        "The trap turned up a second time, in a less obvious place. The repeatable evaluation on 22 September ran all thirteen reference photos through the production pipeline. Seven of them had been sent to the model minutes earlier, during the performance benchmark, so they skipped most of the encoding. One took 6 seconds. On top of that, the project's typecheck and lint were running on the same machine during the evaluation and competing for the CPU.",
        "I did not edit the report to hide this. The generated report is kept as produced, with a \"Read this first\" section at the top. It says the verdicts are reliable and some of the timings are not, lists the two distortions, and points to the dedicated benchmark as the authoritative source for latency. The verdicts were unaffected: the model runs at temperature 0, and they matched the earlier run exactly.",
      ],
    },
    {
      heading: "A figure from another machine carries the same doubt",
      body: [
        "Earlier in the project the model ran on an Apple M4, and a figure of about 5 seconds per photo was reported there. It was never re-measured with new images. So the documentation now says plainly that it may carry the same effect. It is not quoted as the M4's real speed.",
      ],
    },
    {
      heading: "Rules for benchmarking a local vision model",
      body: [
        {
          type: "list",
          items: [
            "Send an image the server has never seen in every timed request. Varying the prompt is not enough if the image repeats.",
            "Separate cold from warm. Loading the model after it was unloaded cost 6.2 s on this machine, which is a different thing from encoding cost.",
            "Run nothing else on the machine. Builds, linters and browser tabs all compete for the same CPU and GPU.",
            "Report a range, not just a mean. The 82-second worst case came from an unusually long answer, and it is the case that hits the timeout.",
            "Keep corrections visible. The documentation says what the old figure was and why it was wrong, so nobody rediscovers it from an old commit and trusts it.",
          ],
        },
        "The broader habit is the one behind the whole project, described in [A Vision Model That Only Observes](/blog/a-vision-model-that-only-observes): record what was measured, including the mistakes, because the next person will otherwise repeat them.",
      ],
    },
  ],
  related: [{ label: "RPOMS AI project", href: "/work/rpoms-ai" }],
};
