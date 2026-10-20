import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "lan-serial-number-extraction-across-router-vendors",
  title: "Extracting Hardware Serial Numbers Over LAN: UPnP, CSTECGI, and SNMP Across Telco Router Vendors",
  description:
    "How the BBTech WiFi Router Diagnostic Tool extracts authentic factory serial numbers directly over an Ethernet connection without an external barcode scanner, handling Kaon, Huawei, and TP-Link routers.",
  date: "2026-10-13",
  category: "Building Real Systems",
  tags: ["Networking", "PowerShell", "UPnP", "SNMP", "Hardware Diagnostics", "Telco Routers", "Win32"],
  contentType: "Technical Guide",
  searchIntent: "problem-aware",
  seoTitle: "LAN Router Serial Extraction: UPnP, CSTECGI, SNMP across Kaon, Huawei, TP-Link",
  relatedProjects: ["router-diagnostic"],
  relatedPosts: [
    "what-an-it-systems-role-actually-involves",
    "common-problems-manual-production-tracking",
    "staged-csv-import-for-operational-data",
  ],
  sections: [
    {
      heading: "The floor bottleneck: thousands of barcode sticker scans",
      body: [
        "On high-volume telco router refurbishment lines, every returned unit must be checked, tested, and logged. Historically, technicians used handheld optical barcode guns to scan the tiny serial barcode printed on the physical router label sticker.",
        "In production, physical labels present frequent failure modes: stickers are scratched, faded by heat, peeled off by subscribers, or obstructed by mounting brackets. Technicians spent minutes manually squinting at microscopic printed serials or typing 16-character alphanumeric strings by hand. To automate this, we built automated LAN serial extraction directly into the BBTech WiFi Router Diagnostic Tool.",
      ],
    },
    {
      heading: "The discovery hierarchy: locating unconfigured routers",
      body: [
        "Before querying a router for its serial, the computer must find its IP address. When factory-reset routers arrive on the bench, DHCP is frequently disabled or slow to negotiate, leaving the technician's laptop on an APIPA self-assigned address (`169.254.x.x`).",
        "The diagnostic tool executes a multi-tiered discovery hierarchy without silently mutating global Windows network settings:",
        {
          type: "flow",
          steps: [
            "Check active default gateway assigned by DHCP",
            "If no gateway, query active Win32 ARP cache via LocalArp P/Invoke (SendARP)",
            "Send SSDP M-SEARCH multicast discovery over UDP port 1900",
            "If on APIPA (169.254.x.x), probe known candidate gateways (192.168.1.254, 192.168.1.1, 192.168.0.1)",
            "Display temporary subnet bridge banner proposing one-click static IP assignment",
          ],
          caption: "Target router discovery sequence under degraded network conditions.",
        },
      ],
    },
    {
      heading: "Vendor-specific extraction protocols",
      body: [
        "Consumer and ISP routers run diverse proprietary firmware stacks. The diagnostic engine implements model-tailored retrieval handlers:",
        {
          type: "table",
          head: ["Router Vendor / Model", "Primary Extraction Channel", "Fallback Channel", "Expected Format"],
          rows: [
            ["KAON Broadband (AR2140)", "UPnP Device Description XML (`/rootDesc.xml`)", "CSTECGI HTTP RPC (`/cgi-bin/cstecgi.cgi`)", "`KAON2140` prefix + 8–12 chars"],
            ["Huawei EchoLife / OptiXstar ONTs", "HTTP ASP device info (`/deviceinfo.asp`, `OntSN`)", "SNMP v2c MIB queries (`1.3.6.1.2.1.1.1.0`)", "`HWTC` prefix or hex `48575443`"],
            ["TP-Link (EX510, Archer AX20)", "UPnP WANIPConnection service XML", "Unauthenticated HTTP status API", "13-character alphanumeric string"],
          ],
          caption: "Vendor protocol breakdown for hardware serial number extraction.",
        },
        "For Kaon AR2140 routers, UPnP root description XML exposes the manufacturer serial tag `<serialNumber>` directly to unauthenticated queries on port 80 or 1900. For Huawei GPON ONTs, parsing unauthenticated javascript variables (`var OntSN = 'HWTC...';`) in the initial login redirection frame yields the hardware serial before authentication challenges occur.",
      ],
    },
    {
      heading: "Strict validation and non-guessing policy",
      body: [
        "A diagnostic tool on a high-throughput line must never guess. If a query returns a placeholder, recording it corrupts inventory records.",
        "The engine applies a strict validation filter: it rejects MAC addresses (both delimited `00:1B:9E...` and raw hex), IP addresses, model strings (`AR2140`), repeated dummy characters (`00000000`, `XXXXXXXX`), sequential numbers (`12345678`), and generic placeholders (`UNKNOWN`, `N/A`). Exact alphanumeric casing is preserved.",
      ],
    },
    {
      heading: "Automated test suite and physical validation",
      body: [
        "The serial extraction engine is verified by **84 automated assertions** across two PowerShell test suites, simulating mock UPnP XML endpoints, HTML payloads, router replacement generation tokens, and credential redaction. It eliminates manual barcode hunting for supported models while preserving complete operator oversight.",
      ],
    },
  ],
};
