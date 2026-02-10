import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { search, searchNews } from "duck-duck-scrape";
import {
  sanitizeAnalyzeApiResponse,
  buildFallbackAnalyzeResponse,
} from "@/lib/analyze-adapter";
import type { AnalyzeApiResponse } from "@/lib/analyze-adapter";

const ANALYZE_YEAR = 2025;

const SYSTEM_PROMPT = `You are a senior marketing and strategy intelligence agent.

System Objective:
Return a rich, fully populated company analysis for the specified {YEAR} (default: 2025), structured for a quarterly timeline and KPI cards. If year-specific data is sparse, you MUST still produce comprehensive, plausible, clearly-labelled content.

Important Rules:
- ALWAYS return 4 complete quarters: Q1, Q2, Q3, Q4.
- NEVER return "no information found", empty strings, or empty arrays.
- If {YEAR}-specific info is sparse:
  - Extrapolate from earlier years, similar companies, or general industry patterns.
  - Clearly label items as "Planned", "Estimated", or "Ongoing" where applicable.
- Each quarter MUST include:
  - A non-empty \`theme\` string.
  - \`activities\`: at least 3 concrete items with short, specific titles and 1–2 sentence descriptions.
  - \`scores\`: numeric values (0–100) for { activity, intensity, peak, perception }.
- Prefer realistic, generalizable marketing initiatives (e.g., CTV partnerships, AI-assisted optimization, first-party data onboarding, retail media tests).
- Do NOT fabricate exact numbers about spend, revenue, or named partners. Use generic phrasing and label as estimates if needed.
- Include a field "logoUrl" in the root "company" object.
  - The "logoUrl" must be one of the following:
    1) A real, public, official brand logo URL (SVG/PNG/JPG/WEBP) served over HTTPS.
    2) null, if no safe, official logo is available.
  - Never invent or guess logos.
  - Never use third-party trademarked logos unless they are the official public logo of the company.
  - If you are uncertain, set "logoUrl": null.
- Output MUST be valid JSON and match the schema below EXACTLY (no prose before/after).

JSON Schema (shape and field names are mandatory):
{
  "company": {
    "name": "string",
    "slug": "kebab-case-string",
    "sector": "string|null",
    "geo": "string|null",
    "logoUrl": "string|null"
  },
  "year": 2025,
  "summary": "1–3 sentences executive summary",
  "highlights": ["bullet", "bullet", "bullet"],
  "risks": ["bullet", "bullet"],
  "initiatives": ["bullet", "bullet"],
  "quarters": [
    {
      "quarter": "Q1",
      "theme": "string",
      "activities": [
        {
          "title": "string",
          "description": "1–2 sentences, concrete action",
          "channel": "e.g., CTV / Search / Social / Retail Media / Programmatic",
          "kpi": "e.g., ROAS, CTR, CPA, brand lift, reach",
          "notes": "optional",
          "confidence": 0.6
        }
      ],
      "scores": {
        "activity": 0,
        "intensity": 0,
        "peak": 0,
        "perception": 0
      }
    }
  ],
  "sources": [
    { "title": "Generic/industry reference or internal reasoning", "url": null, "type": "model" }
  ],
  "confidence_overall": 0.6
}

Validation Rules:
- \`quarters\`: MUST be length 4 with Q1..Q4 in order.
- Each \`activities\` array: length >= 3.
- Each score: integer 0–100 (round if needed).
- If any required field would be empty, generate a reasonable default instead.
- Use only JSON; do NOT include markdown, comments, or trailing commas.

Runtime inputs: You will be given \`companyName\`, \`year\` (default 2025), and search context. Use these to ground your reasoning and still satisfy ALL structural requirements above, even if the search context is sparse or noisy.`;

async function gatherSearchResults(companyName: string): Promise<string> {
  const queries = [
    `${companyName} marketing strategy 2025`,
    `${companyName} news 2025`,
    `${companyName} investor relations 2025`,
    `${companyName} campaigns 2025`,
  ];

  const snippets: string[] = [];

  for (const q of queries) {
    try {
      const webResults = await search(q, { safeSearch: 0 });
      const results = webResults.results ?? [];
      for (let i = 0; i < Math.min(3, results.length); i++) {
        const r = results[i];
        if (r?.title && r?.description) {
          snippets.push(`[${r.title}] ${r.description}`);
        }
      }

      const newsResults = await searchNews(q, { safeSearch: 0 });
      const news = newsResults.results ?? [];
      for (let i = 0; i < Math.min(2, news.length); i++) {
        const n = news[i] as { title?: string; excerpt?: string };
        if (n?.title) {
          snippets.push(`[News: ${n.title}] ${n.excerpt ?? ""}`);
        }
      }
    } catch {
      // ignore individual search failures
    }
  }

  return snippets
    .filter((s, i, arr) => arr.indexOf(s) === i)
    .slice(0, 15)
    .join("\n\n---\n\n");
}

function extractJson(text: string): Record<string, unknown> | null {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    return JSON.parse(jsonMatch[0]) as Record<string, unknown>;
  } catch {
    return null;
  }
}

type CacheKey = string;

const analyzeCache = new Map<CacheKey, AnalyzeApiResponse>();
const pendingRequests = new Map<CacheKey, Promise<AnalyzeApiResponse>>();

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      console.warn("[analyze] Invalid JSON body");
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const companyName =
      body && typeof body === "object" && "companyName" in body
        ? typeof (body as { companyName?: unknown }).companyName === "string"
          ? (body as { companyName: string }).companyName.trim()
          : null
        : null;

    if (!companyName) {
      return NextResponse.json(
        { error: "Missing or invalid companyName" },
        { status: 400 }
      );
    }

    const cacheKey: CacheKey = `${companyName.toLowerCase()}::${ANALYZE_YEAR}`;

    const cached = analyzeCache.get(cacheKey);
    if (cached) {
      if (process.env.NODE_ENV === "development") {
        console.log(`[perf] analyze cache hit ${companyName}`);
      }
      return NextResponse.json(cached);
    }

    const existingPending = pendingRequests.get(cacheKey);
    if (existingPending) {
      const shared = await existingPending;
      return NextResponse.json(shared);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const fallback = sanitizeAnalyzeApiResponse(
        buildFallbackAnalyzeResponse(companyName, ANALYZE_YEAR),
        companyName,
        ANALYZE_YEAR
      );
      analyzeCache.set(cacheKey, fallback);
      return NextResponse.json(fallback, { status: 200 });
    }

    const pendingPromise: Promise<AnalyzeApiResponse> = (async () => {
      const start = Date.now();
      try {
        const searchContext = await gatherSearchResults(companyName);

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          systemInstruction: SYSTEM_PROMPT,
        });

        const result = await model.generateContent(
          `Company: ${companyName}\nYear: ${ANALYZE_YEAR}\n\nSearch results:\n${
            searchContext || "(No search results found)"
          }`
        );

        let content: string;
        try {
          content = result.response.text();
        } catch (e) {
          console.warn("[analyze] Failed to read LLM response text:", e);
          content = "";
        }

        const parsed = extractJson(content);

        if (
          !parsed ||
          ("error" in parsed && typeof (parsed as { error?: unknown }).error === "string")
        ) {
          console.warn(
            "[analyze] LLM did not return valid JSON, using fallback payload.",
            { companyName, contentLength: content?.length ?? 0 }
          );
          const fallback = buildFallbackAnalyzeResponse(
            companyName,
            ANALYZE_YEAR
          );
          const safeFallback = sanitizeAnalyzeApiResponse(
            fallback,
            companyName,
            ANALYZE_YEAR
          );
          analyzeCache.set(cacheKey, safeFallback);
          return safeFallback;
        }

        const safe = sanitizeAnalyzeApiResponse(
          parsed,
          companyName,
          ANALYZE_YEAR
        );

        const elapsed = Date.now() - start;
        console.log(
          `[perf] dynamic analyze completed ${companyName} in ${elapsed}ms`
        );

        analyzeCache.set(cacheKey, safe);
        return safe;
      } catch (error) {
        console.error(
          "[analyze] Pipeline error, falling back to default payload:",
          error
        );
        const fallback = sanitizeAnalyzeApiResponse(
          buildFallbackAnalyzeResponse(companyName, ANALYZE_YEAR),
          companyName,
          ANALYZE_YEAR
        );
        analyzeCache.set(cacheKey, fallback);
        return fallback;
      } finally {
        pendingRequests.delete(cacheKey);
      }
    })();

    pendingRequests.set(cacheKey, pendingPromise);
    const result = await pendingPromise;
    return NextResponse.json(result);
  } catch (err) {
    console.error("Analyze API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
