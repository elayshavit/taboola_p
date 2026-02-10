/**
 * Static enrichment for the four core companies.
 * All content derived exclusively from existing data in data/data.ts.
 * No new facts, no LLM, no external sources.
 */

export interface StaticEnrichment {
  summary_extended: string;
  highlights_extended: string[];
  risks_extended: string[];
  initiatives_extended: string[];
  faq: { q: string; a: string }[];
  sources_local: string[];
}

export const STATIC_ENRICHMENT: Record<
  "taboola" | "teads" | "the-trade-desk" | "simpli-fi",
  StaticEnrichment
> = {
  taboola: {
    summary_extended:
      "Taboola is a native advertising and content recommendation platform that helps publishers monetize and advertisers reach audiences across the open web. It surfaces personalized article and product suggestions across thousands of publisher sites, leveraging contextual and behavioral data at scale. In 2025, Taboola's strategy centered on scaling its long-term Yahoo native partnership, pushing contextual and AI-driven discovery across the open web, and positioning itself as a performance and demand engine ahead of full Yahoo ramp in 2026. The company emphasized ex-TAC gross profit growth, higher-margin demand, and simplification of advertiser workflows while leaning into large CTV and premium inventory partnerships like LG Ad Solutions Performance Enhancer late in the year.",
    highlights_extended: [
      "Native advertising and content recommendations platform powering the open web.",
      "Yahoo-native powered inventory and demand channel with 30-year partnership and ex-TAC $1 billion revenue ambition.",
      "Contextual and interest-based targeting as scaled alternative to walled gardens.",
      "Performance-based open-web advertising with open-web reach toward Yahoo's 900 million users.",
      "CTV and video performance solutions via LG Ad Solutions Performance Enhancer.",
      "Q3 2025 revenue of ~$497 million (15% YoY) and ex-TAC gross profit of ~$177 million.",
      "Diversification beyond traditional publisher widgets into e-commerce, performance advertisers, and premium partners.",
    ],
    risks_extended: [
      "Dependence on Yahoo partnership for a significant share of growth and demand.",
      "Cookie deprecation and industry shifts affecting contextual advertising performance.",
      "Diversification beyond publisher widgets requires execution across new segments.",
      "Margin and free-cash-flow targets depend on disciplined cost management.",
    ],
    initiatives_extended: [
      "Scale Yahoo partnership and ex-TAC gross profit toward $1 billion annual ambition.",
      "Launch and promote LG Ad Solutions Performance Enhancer for CTV performance.",
      "Participate in DMEXCO 2025 and Cannes Lions via Givsly Impact Hub.",
      "Reinforce contextual advertising narrative in cookie-deprecation discussions.",
      "Update FY guidance and investor communications on growth and profitability.",
    ],
    faq: [
      {
        q: "What is Taboola's 2025 strategic focus?",
        a: "Scaling the Yahoo native partnership, contextual and AI-driven discovery, ex-TAC gross profit growth, and CTV partnerships like LG Performance Enhancer.",
      },
      {
        q: "How does Taboola work with Yahoo?",
        a: "Taboola is Yahoo's exclusive native ad partner, powering native inventory and demand with open-web reach toward 900 million users.",
      },
      {
        q: "What is LG Performance Enhancer?",
        a: "An end-to-end performance product with LG Ad Solutions that ties CTV exposure to measurable outcomes.",
      },
    ],
    sources_local: ["data/data.ts", "data/companiesMetrics.ts"],
  },
  teads: {
    summary_extended:
      "Teads is an omnichannel advertising platform that connects brands to premium publishers across video, display, and emerging channels on the open internet. It specializes in full-funnel outcomes, combining creative formats, context-driven addressability, and measurement to deliver brand and performance results. In 2025, Teads focused on making Connected TV a core growth pillar, integrating CTV into its omnichannel stack and promoting AI-powered creative and predictive optimization as differentiators. The company backed this narrative with a high-profile Cannes Lions yacht presence, thought leadership on CTV and AI, and the beta launch of CTV Performance to bring deterministic, outcome-based measurement to CTV globally.",
    highlights_extended: [
      "Omnichannel outcomes platform for the open internet.",
      "In-read and premium video ad formats across screens.",
      "Connected TV advertising and CTV Performance outcome-based measurement.",
      "Teads Predictive AI for creative and media optimization.",
      "Universal Pixel and household graph-based attribution.",
      "Cannes Lions 2025 branded yacht hub and Elevated Outcomes narratives.",
      "Men's Wearhouse CTV Performance case: 41,000+ site visits, 50,000+ incremental store visits.",
    ],
    risks_extended: [
      "Competition in programmatic and CTV measurement space.",
      "CTV Performance beta expansion requires global adoption.",
      "Premium inventory and Cannes presence entail significant marketing investment.",
    ],
    initiatives_extended: [
      "Global beta launch of CTV Performance for deterministic CTV measurement.",
      "Talks with Teads content and Vidaa partnership for CTV inventory.",
      "Predictive AI and neuroscience-informed creative optimization messaging.",
      "Cannes Lions yacht activation and Elevated Outcomes campaigns.",
      "Universal Pixel and household graph-based delivery for high-intent viewers.",
    ],
    faq: [
      {
        q: "What is CTV Performance?",
        a: "A Teads performance solution that tracks site visits, leads, and sales linked to CTV exposure, with attribution via Universal Pixel and household graph.",
      },
      {
        q: "How does Teads use AI?",
        a: "Teads Predictive AI uses neuroscience-informed prediction of creative performance before launch to help brands optimize assets.",
      },
      {
        q: "What was Teads' Cannes Lions 2025 presence?",
        a: "A multi-deck branded yacht as an elevated hub for clients, with daily discussions, VIP hospitality, and Elevated Outcomes narratives.",
      },
    ],
    sources_local: ["data/data.ts", "data/companiesMetrics.ts"],
  },
  "the-trade-desk": {
    summary_extended:
      "The Trade Desk is a global demand-side platform that enables advertisers to buy digital media across channels including CTV, display, audio, and digital out-of-home on the open internet. It emphasizes transparent, data-driven programmatic buying, identity solutions like Unified ID 2.0, and AI-powered decisioning to maximize advertiser outcomes. In 2025, The Trade Desk's strategy revolved around deepening its leadership in CTV and live sports streaming, expanding its AI platform Kokai, and reinforcing its role as champion of the open internet. Key marketing moments included CES 2025 activations with Disney programmatic partnerships, end-of-year media-planning campaigns around Kokai's AI, and ongoing advocacy for an open, identity-based internet.",
    highlights_extended: [
      "Omnichannel demand-side platform for the open internet.",
      "Kokai AI-driven planning and optimization environment.",
      "CTV and live sports programmatic buying with Disney-certified access.",
      "Unified ID 2.0 and Galileo first-party data solution.",
      "Retail media and commerce media buying capabilities.",
      "CES 2025 C Space Studio with Chief Revenue Officer Jed Dederick.",
      "Disney certification for programmatic access via The Trade Desk, DV360, and Yahoo DSP.",
    ],
    risks_extended: [
      "Regulatory and antitrust shifts affecting identity and open internet.",
      "Competition from walled gardens and other DSPs.",
      "Kokai adoption and AI differentiation require ongoing education.",
    ],
    initiatives_extended: [
      "CES 2025 activations and Disney programmatic certification.",
      "Kokai education and end-of-year media planning checklist.",
      "Retail and commerce media alignment at Cannes Lions 2025.",
      "Unified ID 2.0 and Galileo promotion for cookieless performance.",
      "Open internet advocacy and 2026 positioning in executive commentary.",
    ],
    faq: [
      {
        q: "What is Kokai?",
        a: "The Trade Desk's AI layer that helps media traders maintain momentum, troubleshoot issues, and protect performance during peak seasons.",
      },
      {
        q: "What is The Trade Desk's Disney relationship?",
        a: "Disney certified The Trade Desk for programmatic access alongside Google DV360 and Yahoo DSP, positioning it at the center of premium streaming and sports inventory.",
      },
      {
        q: "How does The Trade Desk support the open internet?",
        a: "Through Unified ID 2.0, Galileo, transparent programmatic models, and advocacy for fair, identity-based advertising.",
      },
    ],
    sources_local: ["data/data.ts", "data/companiesMetrics.ts"],
  },
  "simpli-fi": {
    summary_extended:
      "Simpli.fi is an advertising success platform providing programmatic media buying and workflow software to agencies, media teams, and brands, with particular strength in local and mid-market advertisers. It executes over 140,000 campaigns per month for around 40,000 advertisers, using unstructured data to power targeting across CTV, mobile, display, and other formats. In 2025, Simpli.fi focused on productizing AI across the campaign lifecycle with Autopilot AI and Media Planner, while doubling down on streaming TV as a central channel via ZTV and advanced CTV solutions. The company's go-to-market emphasized accessibility, omnichannel planning including search and social, and education around why CTV and streaming are becoming the strategic centerpiece of media budgets.",
    highlights_extended: [
      "Autopilot AI for automated omnichannel campaign design, planning, launch, and optimization.",
      "Media Planner with Plan Assist for AI-powered campaign planning.",
      "140,000+ campaigns per month for 40,000+ advertisers.",
      "Programmatic CTV and streaming TV via ZTV and advanced solutions.",
      "Search and social integration in planner for walled-garden and programmatic.",
      "CES demos of Autopilot AI and Media Planner for streaming TV, video, and audio.",
      "Addressable geo-fencing and granular location-based targeting.",
    ],
    risks_extended: [
      "Local and mid-market advertiser concentration.",
      "Walled-garden and programmatic integration complexity.",
      "Streaming TV budget shift requires ongoing advertiser education.",
    ],
    initiatives_extended: [
      "Autopilot AI and Media Planner launch with Plan Assist.",
      "CES demos and accessibility messaging for all budgets.",
      "Search and social integration with CTV and linear TV planning.",
      "ZTV and streaming TV trend content and education.",
      "AI-generated creative and cross-channel optimization for 2026 planning.",
    ],
    faq: [
      {
        q: "What is Autopilot AI?",
        a: "Simpli.fi's AI solution enabling advertisers to design, plan, launch, and optimize omnichannel campaigns in minutes, with collaborative and communicative interfaces.",
      },
      {
        q: "What is ZTV?",
        a: "Simpli.fi's streaming TV solution providing more control than traditional zoned cable, with granular planning and targeting.",
      },
      {
        q: "Who uses Simpli.fi?",
        a: "2,000+ media teams, executing 140,000+ monthly campaigns for 40,000 advertisers, with strength in local and mid-market.",
      },
    ],
    sources_local: ["data/data.ts", "data/companiesMetrics.ts"],
  },
};
