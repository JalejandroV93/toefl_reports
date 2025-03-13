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
  process.env.GENERATIVE_API_KEY_3 as string // Or a single, configurable key
);
// Use the environment variable for the model, with a default
const geminiModelName = process.env.GEMINI_MODEL_NAME || "gemini-2.0-flash-exp";

const model = genAI.getGenerativeModel({
  model: geminiModelName,
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
  ],
});

// In-memory cache - Consider Redis or similar for production
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

        // *** IMPROVED PROMPT ***
        const prompt = `
          As a TOEFL preparation expert, analyze this student's performance and provide HIGHLY SPECIFIC, personalized resource recommendations.  Avoid generic suggestions.

          Student Profile:
          ${JSON.stringify(skillsData, null, 2)}

          Consider these factors:
          1.  **Specific Weaknesses:**  Identify the student's *most* significant weaknesses within each skill.  Don't just say "improve listening" - say "improve listening comprehension of academic lectures" or "improve note-taking skills during fast-paced conversations".  Use the feedback provided for Speaking and Writing.
          2.  **Current Level:** Tailor recommendations to the student's current level (A2, B1, B2, C1, C2).  A B1 student needs different resources than a C1 student.
          3.  **Resource Variety:**  Recommend a MIX of resource types:  apps, websites, tools, practice exercises, and courses.
          4.  **Free vs. Premium:** Prioritize FREE, high-quality resources, but include *one* premium option per category if it offers significant value.
          5.  **2024 Relevance:**  Focus on UP-TO-DATE resources available in 2024.
          6. **Actionable Descriptions:** Explain *exactly how* each resource addresses the student's needs.

          Provide recommendations in this exact JSON format:
          {
            "categories": [
              {
                "category": "category name",  //  Be specific: e.g., "Vocabulary Building", "Pronunciation Practice", "Academic Listening"
                "description": "brief category description",
                "resources": [
                  {
                    "name": "resource name",
                    "description": "DETAILED description of how this resource helps the student address their specific weaknesses, and why it's appropriate for their level.",
                    "url": "optional URL",
                    "type": "app | website | tool | practice | course", //  Strictly enforce these types
                    "focus": ["specific skills or areas targeted"] //  e.g., ["listening comprehension", "note-taking", "academic vocabulary"]
                  }
                ]
              }
            ]
          }

          Include these categories (but use more specific names):
          - Mobile Learning Apps (focus on SPECIFIC skills)
          - Academic Resources (for academic English)
          - Practice Platforms (for targeted skill practice)
          - Interactive Tools (games, simulations, etc.)
          - Community and Exchange (language exchange, forums)
          - Assessment and Tracking (for self-assessment)
          
          Limit to 1-3 resources per category. NO DUPLICATE recommendations.
        `;

        const result = await model.generateContent(prompt);
        const response = result.response.text();
        const cleanJson = response.replace(/```json\n?|\n?```/g, "").trim();
        console.log("Raw Gemini Response (cleanJson):", cleanJson);
        return JSON.parse(cleanJson);
      }
    );

    resourcesCache.set(cacheKey, geminiResponse);

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
