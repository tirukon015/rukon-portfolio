import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "exposing-local-ollama-to-vercel-through-a-token-gateway",
  title: "Exposing a Local Ollama to a Vercel App: A 90-Line Token Gateway and a Cloudflare Quick Tunnel",
  description:
    "Ollama has no authentication, so its port must never face the internet. The small Node gateway RPOMS AI puts in front of it, the tunnel, and how each hop is diagnosed.",
  date: "2026-10-20",
  category: "AI & Automation",
  tags: ["Ollama", "Cloudflare Tunnel", "Vercel", "Node.js", "Security", "Self-hosted AI"],
  contentType: "Technical Guide",
  searchIntent: "problem-aware",
  seoTitle: "Expose Local Ollama to Vercel Securely",
  relatedProjects: ["rpoms-ai"],
  relatedPosts: [
    "running-qwen2-5-vl-7b-on-intel-iris-xe-with-ollama-vulkan",
    "capping-image-size-for-a-vision-model-inside-a-60-second-limit",
    "node-spawn-on-windows-program-files-path-and-stale-path",
    "what-a-dedicated-inference-server-will-and-wont-fix",
  ],
  sections: [
    {
      heading: "The problem: the website is on Vercel, the model is on a laptop",
      body: [
        "This is for anyone who wants a hosted web app to call a model running on their own hardware. [RPOMS AI](/work/rpoms-ai) is a Next.js app on Vercel. Its vision model, Qwen2.5-VL 7B under Ollama, cannot run there: Vercel functions cannot hold a multi-gigabyte model, and the project's rule is zero mandatory AI cost. So the model runs on a machine we control, and the site calls it over HTTPS.",
        "The obvious move is to tunnel Ollama's port, 11434, to the internet. That would be a mistake. Ollama has no authentication, so an exposed port gives free GPU time, and every model on the machine, to whoever finds the address. The design puts a small gateway in front and points the tunnel only at the gateway.",
        {
          type: "flow",
          steps: ["Browser", "Vercel function", "Cloudflare quick tunnel (HTTPS)", "Gateway on 127.0.0.1:8787 (token)", "Ollama on 127.0.0.1:11434", "qwen2.5vl:7b"],
        },
      ],
    },
    {
      heading: "What the gateway allows, and nothing else",
      body: [
        "The gateway is one Node file of under ninety lines with no dependencies beyond Node itself. It binds to 127.0.0.1, so the only way in from outside is the tunnel. For each request it does the following, in order:",
        {
          type: "list",
          ordered: true,
          items: [
            "Checks `Authorization: Bearer <token>` with a constant-time comparison, and answers 401 otherwise. It refuses to start at all if the token is shorter than 32 characters.",
            "Forwards exactly two routes: `GET /api/tags` and `POST /api/chat`. Everything else gets 404. Pulling, deleting or creating models is simply not reachable.",
            "Allows only the models named in `ALLOWED_MODELS`. A chat request for any other model gets 403, and even the tags list is filtered, so the caller cannot learn what else is installed.",
            "Caps the request body at 8 MB and forces `stream: false`.",
            "Runs chat requests one at a time.",
          ],
        },
        {
          type: "code",
          lang: "js",
          code: `const expected = Buffer.from("Bearer " + TOKEN);
const authorised = (h) => {
  const got = Buffer.from(h || "");
  return got.length === expected.length && timingSafeEqual(got, expected);
};

let busy = Promise.resolve();
const serial = (fn) => {
  const run = busy.then(fn, fn);
  busy = run.catch(() => {});
  return run;
};`,
          caption: "Token check and a one-at-a-time queue, from scripts/inference-gateway.mjs (string concatenation simplified).",
        },
        "The serial queue is deliberate. The host is a laptop with an integrated GPU that is already saturated by one analysis. Two in parallel would both slow down and both miss the timeout. Queuing at least lets the first one finish. The cost is written down: two people submitting together means the second waits about 40 seconds for the first and will usually time out.",
      ],
    },
    {
      heading: "The tunnel and the token",
      body: [
        "The tunnel is a Cloudflare quick tunnel from `cloudflared`, which is free and needs no account: `cloudflared tunnel --url http://127.0.0.1:8787`. It prints a random HTTPS address that changes on every restart. A named tunnel would give a stable address but needs a domain on Cloudflare, so it is the planned upgrade, not the current setup.",
        "One command, `npm run inference`, starts whatever is not already running: Ollama, then the gateway, then the tunnel. It then prints the two values to paste into Vercel, the endpoint URL and the token. The token is generated once with 32 random bytes and saved to a gitignored file, written with mode 0600. So after a restart only the address changes, and the token in Vercel stays valid.",
        "The application enforces the same rule from its side. A vision endpoint that is not localhost is ignored unless it is HTTPS and a token is configured:",
        {
          type: "code",
          lang: "ts",
          code: `const local = /^http:\\/\\/(localhost|127\\.0\\.0\\.1)(:\\d+)?/.test(url);
if (!local && (!token || !url.startsWith("https://"))) return null;`,
          caption: "From src/lib/env.ts. With no endpoint, the site still works: photos are quality-checked, stored and answered with a human-check message.",
        },
      ],
    },
    {
      heading: "Diagnosing which hop is down",
      body: [
        "Three hops can fail, and each needs a different fix. \"AI offline\" as a single red dot sends you to the wrong one. The provider's diagnosis reads the answer to one `GET /api/tags` through the gateway:",
        {
          type: "table",
          head: ["What comes back", "What it means", "What to do"],
          rows: [
            ["No response or timeout", "Tunnel or machine is off", "Wake the machine, restart the tunnel, update the URL"],
            ["401 or 403", "Gateway is up, token mismatch", "Copy the token file into Vercel and redeploy"],
            ["502", "Gateway is up, Ollama is not running", "Start Ollama"],
            ["200 without the model", "Ollama is up, model not pulled", "Run ollama pull"],
            ["200 with the model", "All three hops healthy", "Nothing"],
          ],
        },
        "The gateway already distinguishes these cases on the wire, returning 502 when it cannot reach Ollama. The admin page simply reads them off it, and shows the detail line without ever including the token.",
      ],
    },
    {
      heading: "How it was checked",
      body: [
        "On 20 September 2026, probes against the live tunnel gave these results. No token: 401. A wrong token: 401. The correct token: 200, listing the allowed model only. A path the gateway does not forward: 401, because the token check comes first. Port 11434 was unreachable from the internet. A real inspection then went end to end through the browser, the Vercel function, the tunnel, the gateway and Ollama.",
        "The limits are the honest part. Inference exists only while the laptop is awake and the command is running. The address changes on restart. One analysis runs at a time. RPOMS AI has no model activated in production and has not been used on real line photos, so this path has carried test traffic only. For the speed of the host behind the gateway, see [Running Qwen2.5-VL 7B on an Intel Iris Xe](/blog/running-qwen2-5-vl-7b-on-intel-iris-xe-with-ollama-vulkan). For why a full-size photo needed capping to fit the time budget, see [the 896 px article](/blog/capping-image-size-for-a-vision-model-inside-a-60-second-limit).",
      ],
    },
  ],
  related: [
    { label: "RPOMS AI project", href: "/work/rpoms-ai" },
    { label: "A Vision Model That Only Observes", href: "/blog/a-vision-model-that-only-observes" },
  ],
};
