export type QuarterId = "Q1" | "Q2" | "Q3" | "Q4";
export type CompanyId = string;

export interface QuarterBase {
  id: QuarterId;
  theme: string;
  brandPerception: number;
  marketingIntensity: number;
  keyActivities: string[];
  peak: boolean;
}

export interface ChannelMix {
  events: number;
  pressReleases: number;
  content: number;
  social: number;
}

export type CompanySource = "seed" | "imported";

export interface CompanyBase {
  id: CompanyId;
  name: string;
  tagline: string;
  overview: string;
  strategy2025Summary: string;
  offerings: string[];
  quarters: QuarterBase[];
  channelMix: ChannelMix;
  /** Seed companies use /logos/*.png paths. Ignored when parsing JSON. */
  logoSrc?: string;
  /** Uploaded logo as base64 data URL. Only set via Add Company dialog. */
  logoDataUrl?: string;
  source?: CompanySource;
}

export interface CompanyMetrics {
  perceptionAvg: number;
  intensityAvg: number;
  activityCount: number;
  peakScore: number;
  consistency: number;
  composite: number;
  confidence: number;
}

export type Company = CompanyBase & { metrics: CompanyMetrics };
