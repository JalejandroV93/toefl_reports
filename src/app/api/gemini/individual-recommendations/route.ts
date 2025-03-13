// src/app/api/gemini/individual-recommendations/route.ts
import { NextResponse, NextRequest } from "next/server";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { StudentData } from "@/types";
import { getLevelForScore } from "@/utils/scoreConversion";
import { geminiRateLimiter } from "@/services/geminiRateLimiter"; // Import

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
const individualRecommendationsCache = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const { studentData }: { studentData: StudentData } = await request.json();
    const cacheKey = `individual-${studentData.Nombre}-${studentData["Apellido(s)"]}`;

    if (individualRecommendationsCache.has(cacheKey)) {
      return NextResponse.json({
        success: true,
        data: individualRecommendationsCache.get(cacheKey),
      });
    }

    const geminiResponse = await geminiRateLimiter.enqueue(async () => {
      const skillsData = {
        READING: {
          score: studentData.READING,
          level: getLevelForScore(studentData.READING, "READING"),
        },
        LISTENING: {
          score: studentData.LISTENING,
          level: getLevelForScore(studentData.LISTENING, "LISTENING"),
        },
        SPEAKING: {
          score: studentData.SPEAKING,
          level: getLevelForScore(studentData.SPEAKING, "SPEAKING"),
          feedback: studentData["FEEDBACK SPEAKING"],
        },
        WRITING: {
          score: studentData.WRITING,
          level: getLevelForScore(studentData.WRITING, "WRITING"),
          feedback: studentData["FEEDBACK WRITING"],
        },
      };
      const prompt = `
    Analyze this TOEFL student's performance and generate recommendations.
    Student Data: ${JSON.stringify(skillsData, null, 2)}

    Student Data contains:
    - Section scores (READING, LISTENING, SPEAKING, WRITING)
    - Overall proficiency level
    - Feedback for SPEAKING and WRITING (if available)

    For each skill provide recommendations in JSON format:
    {
        "READING": {
        "strengths": ["strength1", "strength2"],
        "weaknesses": ["weakness1", "weakness2"],
        "shortTermActions": ["action1", "action2", "action3"],
        "longTermStrategy": ["strategy1", "strategy2", "strategy3"]
        },
        "LISTENING": {same structure},
        "SPEAKING": {same structure},
        "WRITING": {same structure}
    }
    `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleanText = text.replace(/```json\n|\n```/g, "").trim();
      return JSON.parse(cleanText);
    });
    individualRecommendationsCache.set(cacheKey, geminiResponse);

    return NextResponse.json({ success: true, data: geminiResponse });
  } catch (error) {
    console.error("Error in individual recommendations API:", error);
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
