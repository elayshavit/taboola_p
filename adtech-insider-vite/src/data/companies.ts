import type { CompanyBase } from "@/types/company";

export const companiesBase: CompanyBase[] = [
  {
    id: "taboola",
    name: "Taboola",
    tagline: "Powering recommendations for the open web",
    overview:
      "Taboola is a native advertising and content recommendation platform that helps publishers monetize and advertisers reach audiences across the open web.",
    strategy2025Summary:
      "In 2025 Taboola's strategy centered on scaling its long-term Yahoo native partnership, pushing contextual and AI-driven discovery across the open web.",
    offerings: [
      "Native advertising and content recommendations platform",
      "Yahoo-native powered inventory and demand channel",
      "Contextual and interest-based targeting solutions",
    ],
    quarters: [
      { id: "Q1", theme: "Foundation for Yahoo ramp", brandPerception: 82, marketingIntensity: 70, keyActivities: ["Reinforced narrative around Yahoo partnership", "Positioned as scaled contextual alternative", "Industry discussions on cookie deprecation"], peak: false },
      { id: "Q2", theme: "Execution and performance", brandPerception: 86, marketingIntensity: 75, keyActivities: ["Q2 2025 financial results", "Raised full-year 2025 guidance", "Yahoo partnership promotion"], peak: false },
      { id: "Q3", theme: "Scale and efficiency", brandPerception: 88, marketingIntensity: 80, keyActivities: ["Q3 results and margin expansion", "FY 2025 guidance update", "Diversification beyond publisher widgets"], peak: false },
      { id: "Q4", theme: "Premium CTV and AI-led open web", brandPerception: 90, marketingIntensity: 85, keyActivities: ["LG Ad Solutions Performance Enhancer", "DMEXCO 2025 panel", "Cannes Lions 2025 participation"], peak: true },
    ],
    channelMix: { events: 12, pressReleases: 8, content: 15, social: 10 },
    logoSrc: "/logos/taboola.png",
    source: "seed",
  },
  {
    id: "teads",
    name: "Teads",
    tagline: "Omnichannel outcomes for the open internet",
    overview:
      "Teads is an omnichannel advertising platform that connects brands to premium publishers across video, display, and emerging channels.",
    strategy2025Summary:
      "In 2025 Teads focused on making Connected TV a core growth pillar, integrating CTV into its omnichannel stack.",
    offerings: [
      "Omnichannel outcomes platform",
      "In-read and premium video ad formats",
      "Connected TV advertising and measurement",
    ],
    quarters: [
      { id: "Q1", theme: "CTV as growth catalyst", brandPerception: 88, marketingIntensity: 80, keyActivities: ["Talks with Teads content", "Omnichannel strategy framing", "CTV premium positioning"], peak: false },
      { id: "Q2", theme: "Cannes thought leadership", brandPerception: 92, marketingIntensity: 90, keyActivities: ["Cannes Lions branded yacht", "Elevated Outcomes narratives", "Premium positioning"], peak: true },
      { id: "Q3", theme: "AI and creative effectiveness", brandPerception: 89, marketingIntensity: 78, keyActivities: ["Predictive AI capabilities", "Thought leadership on AI", "Regional industry events"], peak: false },
      { id: "Q4", theme: "CTV Performance launch", brandPerception: 93, marketingIntensity: 92, keyActivities: ["CTV Performance beta launch", "Men's Wearhouse case study", "Universal Pixel attribution"], peak: true },
    ],
    channelMix: { events: 15, pressReleases: 10, content: 12, social: 14 },
    logoSrc: "/logos/teads.png",
    source: "seed",
  },
  {
    id: "the-trade-desk",
    name: "The Trade Desk",
    tagline: "An objectively better way to advertise on the open internet",
    overview:
      "The Trade Desk is a global demand-side platform that enables advertisers to buy digital media across CTV, display, audio, and digital out-of-home.",
    strategy2025Summary:
      "In 2025 The Trade Desk's strategy revolved around deepening its leadership in CTV and live sports streaming.",
    offerings: [
      "Omnichannel demand-side platform",
      "Kokai AI-driven planning",
      "CTV and live sports programmatic buying",
    ],
    quarters: [
      { id: "Q1", theme: "CES and CTV leadership", brandPerception: 93, marketingIntensity: 95, keyActivities: ["CES 2025 C Space Studio", "Disney certification", "CES social campaigns"], peak: true },
      { id: "Q2", theme: "Retail and commerce media", brandPerception: 88, marketingIntensity: 82, keyActivities: ["Cannes Lions retail media", "Omnichannel retail discussions", "Unified ID 2.0 promotion"], peak: false },
      { id: "Q3", theme: "AI-driven planning with Kokai", brandPerception: 90, marketingIntensity: 80, keyActivities: ["Kokai AI education", "Media planning checklist", "Customer-facing materials"], peak: false },
      { id: "Q4", theme: "Open internet advocacy", brandPerception: 92, marketingIntensity: 78, keyActivities: ["Executive commentary", "2026 positioning", "Thought leadership"], peak: false },
    ],
    channelMix: { events: 20, pressReleases: 14, content: 18, social: 16 },
    logoSrc: "/logos/the-trade-desk.png",
  },
  {
    id: "simpli-fi",
    name: "Simpli.fi",
    tagline: "Advertising success powered by AI and unstructured data",
    overview:
      "Simpli.fi is an advertising success platform providing programmatic media buying and workflow software to agencies and brands.",
    strategy2025Summary:
      "In 2025 Simpli.fi focused on productizing AI across the campaign lifecycle with Autopilot AI and Media Planner.",
    offerings: [
      "Autopilot AI for campaign design",
      "Media Planner with Plan Assist",
      "Programmatic CTV and streaming TV",
    ],
    quarters: [
      { id: "Q1", theme: "AI product launch and CES", brandPerception: 89, marketingIntensity: 90, keyActivities: ["Autopilot AI launch", "CES demos", "Accessibility messaging"], peak: true },
      { id: "Q2", theme: "Omnichannel AI adoption", brandPerception: 87, marketingIntensity: 78, keyActivities: ["Search and social integration", "CTV with linear TV", "Case examples"], peak: false },
      { id: "Q3", theme: "Streaming TV centerpiece", brandPerception: 88, marketingIntensity: 82, keyActivities: ["Streaming TV trends", "ZTV promotion", "Budget shift education"], peak: false },
      { id: "Q4", theme: "Scaling AI performance", brandPerception: 89, marketingIntensity: 80, keyActivities: ["Autopilot AI marketing", "Creative optimization", "Streaming measurement"], peak: false },
    ],
    channelMix: { events: 10, pressReleases: 12, content: 14, social: 8 },
    logoSrc: "/logos/simpli-fi.png",
    source: "seed",
  },
];
