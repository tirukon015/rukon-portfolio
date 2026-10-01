import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "node-spawn-on-windows-program-files-path-and-stale-path",
  title: "Two Windows Bugs in a Node Launcher: \"C:\\Program\" and a PATH That Hadn't Updated",
  description:
    "A one-command launcher for Ollama, a gateway and cloudflared broke on Windows twice: shell: true split the node path at its space, and a fresh install was not on the open terminal's PATH.",
  date: "2026-12-26",
  category: "Full-Stack Development",
  tags: ["Node.js", "Windows", "child_process", "cloudflared", "Ollama", "Debugging"],
  contentType: "Problem/Solution",
  searchIntent: "problem-aware",
  seoTitle: "Node spawn on Windows: shell:true and Stale PATH",
  relatedProjects: ["rpoms-ai"],
  relatedPosts: [
    "exposing-local-ollama-to-vercel-through-a-token-gateway",
    "running-qwen2-5-vl-7b-on-intel-iris-xe-with-ollama-vulkan",
  ],
  sections: [
    {
      heading: "The launcher, and where it broke",
      body: [
        "This note is for anyone using Node's `child_process.spawn` on Windows to start other programs. [RPOMS AI](/work/rpoms-ai) has one command, `npm run inference`, that starts three things in order: Ollama, a small token gateway in front of it, and a Cloudflare quick tunnel to the gateway. It then prints the values to paste into Vercel. The setup is described in [Exposing a Local Ollama to a Vercel App](/blog/exposing-local-ollama-to-vercel-through-a-token-gateway).",
        "When it was first run on the Windows inference host on 20 September 2026, two faults showed up, and both were found by running the command rather than by reading it.",
      ],
    },
    {
      heading: "Bug one: shell: true and a path with a space",
      body: [
        "The original helper spawned every child with `shell: process.platform === \"win32\"`. On Windows, a bare command name like `cloudflared` needs the shell to look it up on PATH, so turning the shell on looked reasonable.",
        "The gateway, though, is started with Node's own executable, `process.execPath`. On a normal Windows install that is `C:\\Program Files\\nodejs\\node.exe`. When Node runs a command through the shell, it joins the command and arguments into one command line, and an unquoted path splits at its spaces. cmd read the gateway command as a program called `C:\\Program` with arguments, and the gateway never started.",
        "The fix was to decide `shell` per command, not per platform. Use the shell only for a bare name that needs a PATH lookup. Never use it for an absolute path you already hold.",
        {
          type: "code",
          lang: "js",
          code: `function start(tag, cmd, args, env = {}, { shell = false } = {}) {
  const child = spawn(cmd, args, { env: { ...process.env, ...env }, shell, stdio: ["ignore", "pipe", "pipe"] });
  children.push(child);
  child.on("error", (e) => log(tag, "failed to start: " + e.message));
  return child;
}

// Absolute path: no shell.
start("gateway", process.execPath, [path.resolve("scripts/inference-gateway.mjs")], gatewayEnv);
// Bare name found on PATH: shell. Absolute path from a known location: no shell.
start("tunnel", cf, ["tunnel", "--url", gatewayUrl, "--no-autoupdate"], {}, { shell: cf === "cloudflared" });`,
          caption: "Simplified from scripts/start-inference.mjs.",
        },
      ],
    },
    {
      heading: "Bug two: installed, but not on this terminal's PATH",
      body: [
        "With the gateway fixed, the gateway came up and the tunnel silently did not. cloudflared had just been installed with winget, but an installer updates the PATH that future shells will read, not the environment of a terminal that is already open. Invoked by bare name from that terminal, `cloudflared` was not found.",
        "\"Close and reopen your terminal\" is the usual advice. But removing manual steps like that is exactly what a one-command launcher is for. So the launcher now resolves cloudflared the way it already resolved Ollama: try the PATH first, then known install locations, then fail with a message that names the install command.",
        {
          type: "code",
          lang: "js",
          code: `function cloudflaredBinary() {
  if (spawnSync("cloudflared", ["--version"], { stdio: "ignore", shell: true }).status === 0) return "cloudflared";
  const candidates =
    process.platform === "win32"
      ? [
          path.join(process.env["ProgramFiles(x86)"] || "", "cloudflared", "cloudflared.exe"),
          path.join(process.env.ProgramFiles || "", "cloudflared", "cloudflared.exe"),
          path.join(process.env.LOCALAPPDATA || "", "Microsoft", "WinGet", "Links", "cloudflared.exe"),
        ]
      : ["/usr/local/bin/cloudflared", "/opt/homebrew/bin/cloudflared"];
  return candidates.find((p) => p && existsSync(p)) ?? null;
}`,
          caption: "From scripts/start-inference.mjs. A found absolute path is then spawned without a shell, so bug one cannot return.",
        },
        "The two fixes reinforce each other. A bare name goes through the shell for the lookup. A resolved full path, which on Windows usually contains spaces, does not.",
      ],
    },
    {
      heading: "Making silent failures loud",
      body: [
        "Both bugs had the same shape: one part of the stack came up and the next quietly did not. The launcher now checks each stage before starting the next. It waits for Ollama to answer on its port, verifies the model is actually pulled, and waits for the gateway to answer. A 401 counts as healthy there, because it means the gateway is up and refusing an unauthenticated probe. It only prints the Vercel values once it has read the tunnel's public address from cloudflared's output, which arrives on stderr. Each failure names the step and the fix.",
        "The broader lesson for cross-platform Node scripts is short. `shell: true` is not a harmless Windows compatibility switch. It changes how arguments are parsed. And \"installed\" does not mean \"on this process's PATH\". The Windows host this was written for is described in [Running Qwen2.5-VL 7B on an Intel Iris Xe](/blog/running-qwen2-5-vl-7b-on-intel-iris-xe-with-ollama-vulkan). RPOMS AI has no model active in production and has not been used on real line photos. The launcher serves the testing host.",
      ],
    },
  ],
  related: [{ label: "RPOMS AI project", href: "/work/rpoms-ai" }],
};
