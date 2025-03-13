// src/app/api/gemini/resources/route.ts
import { NextResponse, NextRequest } from "next/server";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { StudentData } from "@/types";
import { getLevelForScore } from "@/utils/scoreConversion";
import { geminiRateLimiter } from "@/services/geminiRateLimiter"; // Import
import { ResourcesResponse } from "@/hooks/useGeminiResources";

const genAI = new GoogleGenerativeAI(
  process.env.GENERATIVE_API_KEY_3 as string
);
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
const resourcesCache = new Map<string, ResourcesResponse>();

export async function POST(request: NextRequest) {
  try {
    const { studentData }: { studentData: StudentData } = await request.json();
    const cacheKey = `resources-${studentData.Nombre}-${studentData["Apellido(s)"]}`;

    if (resourcesCache.has(cacheKey)) {
      return NextResponse.json({
        success: true,
        data: resourcesCache.get(cacheKey),
      });
    }

    const geminiResponse: ResourcesResponse = await geminiRateLimiter.enqueue(
      async () => {
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
          As an expert in English language learning and academic preparation, analyze this student's performance and provide detailed, personalized resource recommendations.

          Student Profile:
          ${JSON.stringify(skillsData, null, 2)}

          Student Profile includes:
          - Skill scores (READING, LISTENING, SPEAKING, WRITING)
          - Overall proficiency level

          Consider:
         1. Analyze the student's current level and weaknesses in each skill.
          2. Incorporate feedback provided for SPEAKING and WRITING.
          3. Recommend modern learning tools and platforms available in 2024.
          4. Prioritize free resources but include a mix of free and premium options.
          5. Focus on both TOEFL preparation and general academic English development.
          6. Provide 1–3 resources per category.
          Provide recommendations in this exact JSON format:
          {
            "categories": [
              {
                "category": "category name",
                "description": "brief category description",
                "resources": [
                  {
                    "name": "resource name",
                    "description": "detailed description, how it helps the student, and why it is recommended",
                    "url": "optional URL",
                    "type": "app | website | tool | practice | course",
                    "focus": ["specific skills or areas targeted by this resource"]
                  }
                ]
              }
            ]
          }

          Include these diverse categories:
          - Mobile Learning Apps: Tools for learning on the go, focused on listening, vocabulary, and grammar.
          - Academic Resources: Websites or platforms for improving academic English skills.
          - Practice Platforms: Tools for targeted TOEFL or general English practice.
          - Interactive Tools: Games, simulations, or tools for interactive learning.
          - Community and Exchange: Platforms for language exchange, discussion forums, or speaking groups.
          - Assessment and Tracking: Tools for self-assessment and tracking progress.

          Guidelines:
          - Match recommendations to the student's weaknesses and learning needs.
          - Focus on actionable and practical resources.
          - Ensure all resources are relevant and up-to-date as of 2024.
        `;

        const result = await model.generateContent(prompt);
        const response = result.response.text();
        const cleanJson = response.replace(/```json\n?|\n?```/g, "").trim();
        console.log("Raw Gemini Response (cleanJson):", cleanJson);
        return JSON.parse(cleanJson);
      }
    );

    resourcesCache.set(cacheKey, geminiResponse); // Correctly typed

    return NextResponse.json({ success: true, data: geminiResponse });
  } catch (error) {
    console.error("Error in resources API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate resource recommendations",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
