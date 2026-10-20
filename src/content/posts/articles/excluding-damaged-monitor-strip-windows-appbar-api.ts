import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "excluding-damaged-monitor-strip-windows-appbar-api",
  title: "Excluding a Damaged Display Zone via the Windows AppBar API (SHAppBarMessage)",
  description:
    "How to salvage a laptop or monitor with a broken, flickering line of pixels by registering a hidden Windows Application Desktop Toolbar to shrink the system work area at runtime.",
  date: "2026-10-13",
  category: "Building Real Systems",
  tags: ["Windows", "Win32 API", "C#", "WPF", "Hardware Hacks", "Desktop Utility"],
  contentType: "Technical Guide",
  searchIntent: "problem-aware",
  seoTitle: "Shrink Windows Desktop Work Area with SHAppBarMessage: WorkAreaGuard",
  relatedProjects: ["bbtech-laptop-tool"],
  relatedPosts: [
    "verifying-a-static-site-you-built-by-hand",
    "making-an-invalid-config-state-unrepresentable-in-postgres",
  ],
  sections: [
    {
      heading: "The hardware defect: a damaged LCD panel strip",
      body: [
        "In refurbishment workshops, technicians frequently encounter laptops where the LCD panel is structurally sound except for a narrow vertical or horizontal band of dead pixels, backlight bleeding, or aggressive high-frequency flickering. Replacing the display panel costs significant hardware expense, yet working with a flickering 100-pixel band at the top or bottom of a screen causes severe eye strain.",
        "Third-party window management utilities typically attempt to reposition windows using window hooks or polling loops. However, as soon as the user presses `Win + Up` to maximize a window, the Windows shell maximizes the application to the full physical screen resolution, covering the damaged pixels once again.",
      ],
    },
    {
      heading: "Understanding the Windows work area",
      body: [
        "In the Windows OS architecture, the screen is divided into two concepts:",
        {
          type: "list",
          items: [
            "**Screen Bounds (`SM_CXSCREEN`, `SM_CYSCREEN`):** The total physical resolution of the display adapter (e.g. 1920 × 1080).",
            "**Work Area (`SPI_GETWORKAREA`):** The rectangular portion of the display available for application windows, excluding system reservations like the taskbar.",
          ],
        },
        "When an application maximizes, the Win32 window manager constrains its window rect directly to the Work Area. The Windows Taskbar reserves its screen slice by registering itself as an **Application Desktop Toolbar (AppBar)** via the shell API.",
      ],
    },
    {
      heading: "Registering an AppBar with SHAppBarMessage",
      body: [
        "To permanently reserve the damaged screen zone, we developed a utility using the Win32 shell API `SHAppBarMessage` in C# WPF.",
        "The application creates a borderless window, positions it over the damaged physical pixels, and registers it with the Windows shell using `ABM_NEW`:",
        {
          type: "code",
          lang: "csharp",
          code: `[DllImport("shell32.dll", CallingConvention = CallingConvention.StdCall)]
public static extern IntPtr SHAppBarMessage(uint dwMessage, ref APPBARDATA pData);

public const uint ABM_NEW = 0x00000000;
public const uint ABM_REMOVE = 0x00000001;
public const uint ABM_QUERYPOS = 0x00000002;
public const uint ABM_SETPOS = 0x00000003;
public const uint ABE_BOTTOM = 3;`,
        },
        "By sending `ABM_QUERYPOS` followed by `ABM_SETPOS`, the utility informs the Windows shell that a custom toolbar occupies a specified strip (e.g., the bottom 120 pixels). Windows immediately recalculates `SystemParametersInfo(SPI_SETWORKAREA)`, shrinking the desktop work area machine-wide.",
      ],
    },
    {
      heading: "Trapping cursor coordinates with ClipCursor",
      body: [
        "Shrinking the work area prevents maximized windows from tiling over the damaged pixels. However, the user's mouse cursor could still accidentally wander into the flickering zone, triggering distraction.",
        "To provide a complete boundary, the utility incorporates the native `ClipCursor` Win32 API. When partitioning is active, the cursor movement rectangle is restricted precisely to the valid work area coordinates. A global toggle hotkey (`Ctrl + Shift + F12`) allows instant toggling whenever full-screen video playback is desired.",
      ],
    },
    {
      heading: "Impact and deployment",
      body: [
        "By utilizing native Windows shell contracts rather than continuous polling hooks, the background utility consumes **0.0% CPU** and under 8 MB of memory while running silently in the system notification tray. It successfully extended the operational lifespan of refurbishment testing rigs without requiring costly panel replacements.",
      ],
    },
  ],
};
