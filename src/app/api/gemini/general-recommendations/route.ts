// src/app/api/gemini/general-recommendations/route.ts
import { NextResponse, NextRequest } from "next/server";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { ChartData } from "@/types";
import { geminiRateLimiter } from "@/services/geminiRateLimiter"; // Import your rate limiter

// Setup Gemini
const genAI = new GoogleGenerativeAI(process.env.GENERATIVE_API_KEY as string);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
  ],
});

// In-memory cache (consider a more robust solution for production)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const generalRecommendationsCache = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const { distributionData }: { distributionData: ChartData[] } =
      await request.json();
    const dataString = JSON.stringify(distributionData);
    const cacheKey = `general-${dataString}`;

    // Check cache first
    if (generalRecommendationsCache.has(cacheKey)) {
      return NextResponse.json({
        success: true,
        data: generalRecommendationsCache.get(cacheKey),
      });
    }

    // Rate limiting (using your existing limiter)
    const geminiResponse = await geminiRateLimiter.enqueue(async () => {
      const prompt = `
Analyze this TOEFL skills distribution data and generate recommendations:
${dataString}

Generate a JSON response with exactly this structure:
{
    "shortTermActions": [
    "4 specific immediate actions to improve the weakest areas",
    "should be concrete and actionable",
    "focus on quick wins and critical improvements",
    "consider the current distribution of levels"
    ],
    "longTermStrategy": [
    "4 strategic long-term recommendations",
    "should focus on sustainable improvement",
    "consider program-level changes and systematic approaches",
    "aim for overall skill integration and advancement"
    ]
}

The recommendations should:
- Be in English
- Be specific and actionable
- Be based on the actual data patterns
- Consider both strengths and weaknesses
- Focus on institutional/program-level actions
`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleanText = text.replace(/```json\n|\n```/g, "").trim();
      return JSON.parse(cleanText);
    });

    // Cache the result
    generalRecommendationsCache.set(cacheKey, geminiResponse);

    return NextResponse.json({ success: true, data: geminiResponse });
  } catch (error) {
    console.error("Error in general recommendations API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate recommendations",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
