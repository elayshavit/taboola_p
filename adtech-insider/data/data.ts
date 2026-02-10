import type { CompanyData, CompanySlug } from "@/types";
import { normalizeCompanies } from "@/lib/normalize";
import { canonicalToCompanyData } from "@/lib/adapter";
import type { CanonicalCompanyData } from "@/lib/schema";
import { runCompareSanityChecks } from "@/lib/compare.sanity";

/** Raw input JSON - matches external schema (id, name, quarterly_data with quarter, main_theme, etc.) */
export const rawCompaniesJson = [
  {
    id: "taboola",
    name: "Taboola",
    tagline: "Powering recommendations for the open web",
    overview:
      "Taboola is a native advertising and content recommendation platform that helps publishers monetize and advertisers reach audiences across the open web. It surfaces personalized article and product suggestions across thousands of publisher sites, leveraging contextual and behavioral data at scale.",
    strategy_2025_summary:
      "In 2025 Taboola's strategy centered on scaling its long-term Yahoo native partnership, pushing contextual and AI-driven discovery across the open web, and positioning itself as a performance and demand engine ahead of full Yahoo ramp in 2026. The company emphasized ex-TAC gross profit growth, higher-margin demand, and simplification of advertiser workflows while leaning into large CTV and premium inventory partnerships like LG Ad Solutions Performance Enhancer late in the year.",
    offerings: [
      "Native advertising and content recommendations platform",
      "Yahoo-native powered inventory and demand channel",
      "Contextual and interest-based targeting solutions",
      "Performance-based open-web advertising",
      "CTV and video performance solutions via partners (e.g., LG Ad Solutions Performance Enhancer)",
    ],
    quarterly_data: [
      { quarter: "Q1 2025", main_theme: "Foundation for Yahoo ramp", brand_perception: "Scale", marketing_intensity_score: 70, perception_score: 82, key_activities: ["Reinforced narrative around 30-year Yahoo native advertising partnership and ex-TAC $1 billion annual revenue ambition in 2025–2026 investor and industry communications.", "Positioned Taboola as a scaled contextual alternative to walled gardens in earnings and capital markets materials, highlighting open-web reach toward Yahoo's 900 million users.", "Participated in early-2025 industry discussions around cookie deprecation and contextual advertising as performance engine for publishers and advertisers (open-web strategy content)."] },
      { quarter: "Q2 2025", main_theme: "Execution and performance narrative", brand_perception: "Performance", marketing_intensity_score: 75, perception_score: 86, key_activities: ["Reported strong Q2 2025 financial results with revenues of $465.5 million (up 8.7% YoY) and gross profit of $135.6 million (up 18.2% YoY), using earnings communications to reinforce growth and profitability story.", "Raised full-year 2025 guidance for revenue and ex-TAC gross profit, marketing Taboola as a disciplined growth and cash-generation story to investors and partners.", "Continued promotion of Yahoo partnership as a key growth driver in 2025–2026 in prepared remarks and investor decks, framing Taboola as Yahoo's exclusive native ad partner."] },
      { quarter: "Q3 2025", main_theme: "Scale and efficiency", brand_perception: "Resilience", marketing_intensity_score: 80, perception_score: 88, key_activities: ["Announced Q3 2025 results with approximately $497 million in revenue (15% YoY growth) and ex-TAC gross profit of about $177 million, spotlighting margin expansion and strong free cash flow in investor messaging.", "Updated FY 2025 guidance to revenues of roughly $1.91–$1.93 billion and ex-TAC gross profit of $700–$703 million, positioning Taboola as a scaled, durable open-web demand platform.", "Used earnings and financial communications to emphasize diversification beyond traditional publisher widgets into e-commerce, performance advertisers, and premium partners."] },
      { quarter: "Q4 2025", main_theme: "Premium CTV partnership and AI-led open web", brand_perception: "Innovation", marketing_intensity_score: 85, perception_score: 90, key_activities: ["Partnered with LG Ad Solutions to launch Performance Enhancer, an end-to-end performance product tying CTV exposure to measurable outcomes, enhancing Taboola's performance positioning in connected TV.", 'Featured senior Taboola leadership at DMEXCO 2025 "Between Automation and Individualization: The Year in Adtech 2025" panel, shaping industry narrative on AI, contextual relevance, and responsible automation for the open web.', "Hosted Taboola programming and executive participation at Cannes Lions 2025 via the Givsly Impact Hub, aligning the brand with responsible, values-based marketing conversations and premium brand marketers."] },
    ],
  },
  {
    id: "teads",
    name: "Teads",
    tagline: "Omnichannel outcomes for the open internet",
    overview:
      "Teads is an omnichannel advertising platform that connects brands to premium publishers across video, display, and emerging channels on the open internet. It specializes in full-funnel outcomes, combining creative formats, context-driven addressability, and measurement to deliver brand and performance results.",
    strategy_2025_summary:
      "In 2025 Teads focused on making Connected TV a core growth pillar, integrating CTV into its omnichannel stack and promoting AI-powered creative and predictive optimization as differentiators. The company backed this narrative with a high-profile Cannes Lions yacht presence, thought leadership on CTV and AI, and the beta launch of CTV Performance to bring deterministic, outcome-based measurement to CTV globally.",
    offerings: [
      "Omnichannel outcomes platform for the open internet",
      "In-read and premium video ad formats",
      "Connected TV (CTV) advertising and measurement solutions",
      "Teads Predictive AI for creative and media optimization",
      "CTV Performance outcome-based CTV measurement",
      "Universal Pixel and household graph-based attribution",
    ],
    quarterly_data: [
      { quarter: "Q1 2025", main_theme: "CTV as growth catalyst", brand_perception: "Innovation", marketing_intensity_score: 80, perception_score: 88, key_activities: ['Published "Talks with Teads" content positioning 2025 as a defining year for CTV, highlighting expansion of CTV reach and Vidaa partnership for exclusive CTV inventory in markets like the Netherlands.', "Framed Teads' omnichannel strategy as unifying inventory and insights across screens, using AI to drive better consumer experiences and advertiser outcomes in interviews and blog content.", "Promoted Teads' role in reclaiming audiences shifting from desktop and mobile to CTV, emphasizing premium, brand-safe environments on the biggest screen in the household."] },
      { quarter: "Q2 2025", main_theme: "Cannes thought leadership and premium positioning", brand_perception: "Premium", marketing_intensity_score: 90, perception_score: 92, key_activities: ["Activated a multi-deck branded yacht at Cannes Lions 2025 as an elevated hub for clients, featuring daily discussions, VIP hospitality, and high-visibility creative experiences.", "Used Cannes programming to underscore themes such as premium audiences, balancing brand equity and performance, and omnichannel creative storytelling.", 'Ran "Elevated Outcomes" narratives across social and owned media, inviting partners to onboard for Cannes sessions focused on the next era of advertising effectiveness.'] },
      { quarter: "Q3 2025", main_theme: "AI and creative effectiveness narrative", brand_perception: "Effectiveness", marketing_intensity_score: 78, perception_score: 89, key_activities: ["Advanced messaging around Teads' predictive AI capabilities, emphasizing neuroscience-informed prediction of creative performance before launch to help brands optimize assets.", "Published thought leadership on how AI, automation, and premium inventory drive responsible, high-attention environments and measurable outcomes across the open internet.", "Engaged in regional industry events and customer communications highlighting AI-powered planning and creative insights as differentiators in a crowded programmatic landscape."] },
      { quarter: "Q4 2025", main_theme: "CTV Performance launch and measurement", brand_perception: "Accountability", marketing_intensity_score: 92, perception_score: 93, key_activities: ["Announced global beta launch of CTV Performance, a performance solution that tracks site visits, leads, and sales linked to CTV exposure, bringing deterministic CTV measurement to markets outside the US.", "Promoted case studies such as a Men's Wearhouse campaign where CTV Performance drove over 41,000 site visits and 50,000+ incremental store visits, showcasing full-funnel impact of CTV.", "Highlighted benefits like attribution through Teads' Universal Pixel, household graph-based delivery, and proprietary algorithms focusing on high-intent viewers in PR and sales materials."] },
    ],
  },
  {
    id: "the-trade-desk",
    name: "The Trade Desk",
    tagline: "An objectively better way to advertise on the open internet",
    overview:
      "The Trade Desk is a global demand-side platform that enables advertisers to buy digital media across channels including CTV, display, audio, and digital out-of-home on the open internet. It emphasizes transparent, data-driven programmatic buying, identity solutions like Unified ID 2.0, and AI-powered decisioning to maximize advertiser outcomes.",
    strategy_2025_summary:
      "In 2025 The Trade Desk's strategy revolved around deepening its leadership in CTV and live sports streaming, expanding its AI platform Kokai, and reinforcing its role as champion of the open internet. Key marketing moments included CES 2025 activations with Disney programmatic partnerships, end-of-year media-planning campaigns around Kokai's AI, and ongoing advocacy for an open, identity-based internet in the wake of major regulatory and antitrust shifts.",
    offerings: [
      "Omnichannel demand-side platform for the open internet",
      "Kokai AI-driven planning and optimization environment",
      "CTV and live sports programmatic buying",
      "Unified ID 2.0 identity framework and Galileo first-party data solution",
      "Retail media and commerce media buying capabilities",
      "Data, measurement, and premium inventory integrations (including Disney-certified access)",
    ],
    quarterly_data: [
      { quarter: "Q1 2025", main_theme: "CES and CTV leadership", brand_perception: "Leadership", marketing_intensity_score: 95, perception_score: 93, key_activities: ["Featured Chief Revenue Officer Jed Dederick in CES 2025 C Space Studio, highlighting The Trade Desk's position as a gateway to the premium open internet and leader in programmatic live sports buying with Disney.", "Celebrated certification from Disney for programmatic access via The Trade Desk, Google DV360, and Yahoo DSP, positioning the platform at the center of premium streaming and sports inventory.", "Ran CES 2025 social campaigns emphasizing ad tech and AI as central to the show, underscoring The Trade Desk's role in powering retail media and streaming channels."] },
      { quarter: "Q2 2025", main_theme: "Retail and commerce media emphasis", brand_perception: "Scale", marketing_intensity_score: 82, perception_score: 88, key_activities: ["Aligned with Cannes Lions 2025 themes around retail and commerce media maturity as the festival added new retail media categories, reinforcing The Trade Desk's commerce capabilities in client communications.", "Participated in broader industry discussions on omnichannel full-funnel retail media, with messaging around cross-platform allocation and durable commerce media systems.", "Promoted Unified ID 2.0 and Galileo as identity and first-party data solutions enabling performance in a cookieless retail and commerce media ecosystem."] },
      { quarter: "Q3 2025", main_theme: "AI-driven planning with Kokai", brand_perception: "Innovation", marketing_intensity_score: 80, perception_score: 90, key_activities: ["Expanded education around Kokai as the AI layer that helps media traders maintain momentum, troubleshoot issues, and protect performance automatically during peak seasons.", "Distributed content such as the 2025 end-of-year media planning checklist, framing Kokai's AI as essential for Q4 optimization across channels.", "Integrated Kokai messaging into customer-facing materials to highlight how AI augments human decision-making in programmatic buying."] },
      { quarter: "Q4 2025", main_theme: "Open internet advocacy and 2026 setup", brand_perception: "Trust", marketing_intensity_score: 78, perception_score: 92, key_activities: ["Used executive commentary to describe 2025 as one of the biggest game-changer years in adtech history, tying DOJ actions against Google and AI accountability to a stronger open internet.", 'Positioned 2026 as "the best year yet" for the open internet, emphasizing The Trade Desk\'s role at the center of AI, identity, and premium inventory in interviews and speaking engagements.', "Continued to promote fair, transparent programmatic models and open-internet advocacy across thought leadership content."] },
    ],
  },
  {
    id: "simpli-fi",
    name: "Simpli.fi",
    tagline: "Advertising success powered by AI and unstructured data",
    overview:
      "Simpli.fi is an advertising success platform providing programmatic media buying and workflow software to agencies, media teams, and brands, with particular strength in local and mid-market advertisers. It executes over 140,000 campaigns per month for around 40,000 advertisers, using unstructured data to power targeting across CTV, mobile, display, and other formats.",
    strategy_2025_summary:
      "In 2025 Simpli.fi focused on productizing AI across the campaign lifecycle with Autopilot AI and Media Planner, while doubling down on streaming TV as a central channel via ZTV and advanced CTV solutions. The company's go-to-market emphasized accessibility, omnichannel planning (including search and social), and education around why CTV and streaming are becoming the strategic centerpiece of media budgets.",
    offerings: [
      "Autopilot AI for automated omnichannel campaign design, planning, launch, and optimization",
      "Media Planner with Plan Assist for AI-powered campaign planning",
      "Programmatic CTV and streaming TV (ZTV and related solutions)",
      "Programmatic display, mobile, video, and audio",
      "Addressable geo-fencing and granular location-based targeting",
      "Workflow and reporting software for agencies and media teams",
    ],
    quarterly_data: [
      { quarter: "Q1 2025", main_theme: "AI product launch and CES demos", brand_perception: "Innovation", marketing_intensity_score: 90, perception_score: 89, key_activities: ["Launched Simpli.fi Autopilot AI and Media Planner with Plan Assist, enabling advertisers to design, plan, launch, and optimize omnichannel campaigns in minutes.", "Showcased Autopilot AI and Media Planner at CES in Las Vegas, giving marketers live demos of AI-driven workflows spanning streaming TV, online video, and audio.", "Promoted messaging that Simpli.fi's AI solutions make programmatic advertising accessible for all budgets by simplifying campaign planning and creative generation."] },
      { quarter: "Q2 2025", main_theme: "Omnichannel AI and workflow adoption", brand_perception: "Ease", marketing_intensity_score: 78, perception_score: 87, key_activities: ["Expanded communications around integrating search and social capabilities into the planner to manage walled-garden campaigns alongside programmatic in one place.", "Highlighted capabilities that link CTV with linear TV planning, positioning Simpli.fi as enabling true omnichannel media buying.", "Published case examples and customer testimonials emphasizing Autopilot AI's collaborative and communicative interface for marketers."] },
      { quarter: "Q3 2025", main_theme: "Streaming TV as centerpiece", brand_perception: "Growth", marketing_intensity_score: 82, perception_score: 88, key_activities: ["Released content on 2025 streaming TV trends, asserting that CTV is becoming the strategic centerpiece of media plans as Simpli.fi sees accelerating growth in CTV campaigns from 2023–2025.", "Promoted ZTV and Simpli.fi's streaming TV solutions as providing more control than traditional zoned cable, with granular planning and targeting.", "Educated advertisers on shifting larger shares of media budgets into CTV using Simpli.fi tools for planning, execution, and measurement."] },
      { quarter: "Q4 2025", main_theme: "Scaling AI-driven performance and CTV narrative", brand_perception: "Performance", marketing_intensity_score: 80, perception_score: 89, key_activities: ["Continued to market Autopilot AI and Media Planner as core workflow tools for 2,000+ media teams, emphasizing execution of 140,000+ monthly campaigns and 40,000 advertisers.", "Reinforced messaging on AI-generated creative assets and cross-channel optimization heading into 2026 planning cycles.", "Maintained education and content around streaming TV measurement, performance metrics such as completion rates and store visits, and omnichannel reporting."] },
    ],
  },
];

/** Canonical company data - normalized and validated. Use for compare metrics. */
export const ALL_COMPANIES: CanonicalCompanyData[] = normalizeCompanies(rawCompaniesJson);

if (typeof window === "undefined" && process.env.NODE_ENV === "development") {
  const sanity = runCompareSanityChecks(ALL_COMPANIES);
  if (!sanity.ok) {
    console.warn("[adtech-data] Compare sanity checks failed:", sanity.errors);
  }
}

/** App-compatible company data for UI components (command-center, etc.) */
export const ALL_COMPANIES_APP: CompanyData[] = ALL_COMPANIES.map(canonicalToCompanyData);

const DATA_MAP = new Map<CompanySlug, CompanyData>(
  ALL_COMPANIES.map((c) => [c.slug as CompanySlug, canonicalToCompanyData(c)])
);

export function getCompany(slug: CompanySlug): Promise<CompanyData> {
  const data = DATA_MAP.get(slug);
  if (!data) {
    return Promise.reject(new Error(`Company not found: ${slug}`));
  }
  return Promise.resolve(data);
}

export function getCompanySync(slug: CompanySlug): CompanyData | undefined {
  return DATA_MAP.get(slug);
}
