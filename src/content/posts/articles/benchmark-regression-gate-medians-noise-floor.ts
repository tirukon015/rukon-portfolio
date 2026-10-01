import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "benchmark-regression-gate-medians-noise-floor",
  title: "A Performance Gate That Stopped Crying Wolf: Medians and a Noise Floor",
  description:
    "A baseline-versus-current benchmark flagged regressions on identical code. Medians of three runs and a rule that ignores tiny metrics made it a gate worth trusting.",
  date: "2026-10-02",
  category: "Building Real Systems",
  tags: ["Benchmarking", "Performance testing", "CI", "Vitest", "Git worktree", "Regression testing"],
  contentType: "Problem/Solution",
  searchIntent: "problem-aware",
  seoTitle: "Stable Benchmark Regression Gates With Medians",
  relatedProjects: ["rpoms-print-engine"],
  relatedPosts: [
    "instrumenting-a-web-bluetooth-print-pipeline",
    "freezing-label-templates-with-raster-hash-tests",
    "testing-pwa-offline-boot-headless-chrome-devtools-protocol",
  ],
  sections: [
    {
      heading: "A gate that failed on unchanged code",
      body: [
        "Before a large rework of the [RPOMS Print Engine](/work/rpoms-print-engine) on 25 September 2026, the last commit before it was tagged as a baseline, with one requirement: the rework must not make the software path slower. To check that, I wrote a comparison tool and a regression gate. On a re-run, single runs flagged regressions in code paths that were identical at both commits.",
        "If you have a performance check in CI that fails at random and gets re-run until it passes, this note is about why that happens with small numbers and the two rules that fixed it here.",
      ],
    },
    {
      heading: "How the comparison works",
      body: [
        "The tool checks out the baseline tag into a temporary git worktree, copies the current benchmark test file into it so both sides measure the same thing, and links the existing `node_modules` instead of reinstalling. On Windows that link is a directory junction, which needs no special privilege. It runs the benchmark at the baseline, removes the worktree, runs it again on the working tree, and writes a Markdown report with a delta for every metric.",
        "The benchmark itself drives the real pipeline, from scan to detection, template, render, queue and Bluetooth writes, against a simulated printer, at 1, 10, 25, 50 and 100 labels. It records eleven metrics per run: start-up, scan handling, detection, template resolution, render, raster, queue wait, printer setup, row transfer, total cycle time and labels per minute.",
        {
          type: "callout",
          label: "What these numbers are",
          text: "They measure the software path with a simulated printer. About 1,500 labels a minute at 100 labels is a ceiling for our side, not a speed anyone will see. The physical printer is far slower, and its real numbers have to come from the hardware.",
        },
      ],
    },
    {
      heading: "Why small metrics lie",
      body: [
        "Several of those metrics are tiny. Rendering a label averages a fraction of a millisecond once warm. Building the raster takes one to four. At that size, a single run is dominated by things that have nothing to do with the code: JIT warm-up on the first render, garbage collection, and timer jitter in the simulated transport.",
        "The final report still shows what that looks like. In the one-label run, the raster step went from 2 ms at the baseline to 4 ms in the new code. As a percentage that is +100%. As a fact it is two milliseconds on one sample, on a step whose code did not change in any way that matters. Render times show +200% and +300% at other sizes for the same reason: the baseline is a few hundredths of a millisecond.",
        "A gate that compares single runs by percentage will flag those every time. And a gate that fails on noise gets ignored, which is worse than having no gate.",
      ],
    },
    {
      heading: "Two rules",
      body: [
        "The first rule: run each configuration three times and compare medians. A median of three ignores one outlier in either direction, which is exactly the shape of a GC pause or a cold JIT.",
        "The second rule: a metric only counts as a regression if all three of these hold.",
        {
          type: "code",
          lang: "js",
          code: "// lower-is-better metrics\nconst worse = pct > 15 && final - baseline > 5 && baseline >= 10;",
          caption: "From the comparison tool, renamed for readability.",
        },
        "The baseline value must be at least 10 ms, so metrics too small to measure reliably cannot fail the gate. The change must be more than 15 percent, so normal variation on larger numbers passes. And it must be more than 5 ms in absolute terms, so a 16 percent change on a 12 ms metric, which is 2 ms, does not count either. Labels per minute, where higher is better, fails on a drop of more than 15 percent.",
        "With those rules the re-run passed. The total cycle for 100 labels was 3,982 ms at the baseline and 3,968 ms after the rework, and every total stayed within about five percent of the baseline. Those are the numbers the gate is there to protect, and they are big enough to measure.",
      ],
    },
    {
      heading: "What I would keep",
      body: [
        "The tiny metrics are still in the report. They are useful to read, because a jump from 2 ms to 40 ms in raster time would be worth looking at. They just do not decide the build. The gate decides on what is measurable; a person reads the rest.",
        "The worktree trick is the other part worth copying. Comparing against a tagged commit on the same machine, in the same run, with the same benchmark code, removes most of the variation that comes from comparing against a number saved weeks ago on different hardware.",
        "None of this says anything about the physical printer. Measuring that is a separate job, with per-stage timings recorded from the printer's own replies, and is described in a later article on instrumenting the print pipeline.",
      ],
    },
  ],
};
