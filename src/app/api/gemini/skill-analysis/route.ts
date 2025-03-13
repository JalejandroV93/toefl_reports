// src/app/api/gemini/skill-analysis/route.ts
import { NextResponse, NextRequest } from "next/server";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { ChartData } from "@/types";
import { geminiRateLimiter } from "@/services/geminiRateLimiter";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
  ],
});

// In-memory cache
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const skillAnalysisCache = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const { distributionData }: { distributionData: ChartData[] } =
      await request.json();
    const dataString = JSON.stringify(distributionData);
    const cacheKey = `skill-analysis-${dataString}`;

    if (skillAnalysisCache.has(cacheKey)) {
      return NextResponse.json({
        success: true,
        data: skillAnalysisCache.get(cacheKey),
      });
    }

    const geminiResponse = await geminiRateLimiter.enqueue(async () => {
      const prompt = `
    Analyze this TOEFL skills distribution data and provide specific insights for each skill:
    ${dataString}

    For each skill, analyze:
    - Level distribution patterns
    - Areas where students excel
    - Common challenges and gaps
    - Notable trends or patterns
    - Impact on overall learning outcomes

    Generate a JSON response with exactly this structure:
    {
        "Reading": {
        "strengths": ["3-4 specific strengths based on the data",
        "focus on concrete observations",
        "highlight positive patterns"
        ],
        "improvements": ["3-4 specific areas needing improvement",
        "based on identified gaps",
        "actionable insights"
        ]
    },
    "Listening": {same structure},
    "Speaking": {same structure},
    "Writing": {same structure}
    }

    Requirements:
    - Base all analysis on the actual data patterns
    - Be specific and detailed in observations
    - Focus on institutional-level patterns
    - Identify systemic strengths and weaknesses
    - Consider the distribution across all levels
    `;
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleanText = text.replace(/```json\n?|```/g, "").trim();
      return JSON.parse(cleanText);
    });
    skillAnalysisCache.set(cacheKey, geminiResponse);

    return NextResponse.json({ success: true, data: geminiResponse });
  } catch (error) {
    console.error("Error in skill analysis API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate skill analysis",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
