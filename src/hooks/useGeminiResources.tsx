import { StudentData } from '@/types';
import { getLevelForScore } from '@/utils/scoreConversion';
import { GoogleGenerativeAI } from '@google/generative-ai';
// hooks/useGeminiResources.tsx
import { useEffect, useState } from 'react';

export interface ResourceCategory {
  category: string;
  description: string;
  resources: {
    name: string;
    description: string;
    url?: string;
    type: 'app' | 'website' | 'tool' | 'practice' | 'course';
    focus: string[];
  }[];
}

export interface ResourcesResponse {
  categories: ResourceCategory[];
}

export const useGeminiResources = (studentData: StudentData) => {
  const [resources, setResources] = useState<ResourcesResponse>({ categories: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResources = async () => {
      const skillsData = {
        READING: {
          score: studentData.READING,
          level: getLevelForScore(studentData.READING, "READING")
        },
        LISTENING: {
          score: studentData.LISTENING,
          level: getLevelForScore(studentData.LISTENING, "LISTENING")
        },
        SPEAKING: {
          score: studentData.SPEAKING,
          level: getLevelForScore(studentData.SPEAKING, "SPEAKING"),
          feedback: studentData["FEEDBACK SPEAKING"],
        },
        WRITING: {
          score: studentData.WRITING,
          level: getLevelForScore(studentData.WRITING, "WRITING"),
          feedback: studentData['FEEDBACK WRITING']
        }
      };

      const cachedKey = `gemini-resources-${studentData.Nombre}-${studentData["Apellido(s)"]}-v1`;
      const cached = localStorage.getItem(cachedKey);

      if (cached) {
        setResources(JSON.parse(cached));
        setIsLoading(false);
        return;
      }

      try {
        const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!API_KEY) {
          throw new Error('Gemini API key not found');
        }

        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

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
        let parsed;
        
        try {
          // Intentar limpiar y parsear la respuesta
          const cleanJson = response.replace(/```json\n?|\n?```/g, '').trim();
          parsed = JSON.parse(cleanJson);
        } catch (parseError) {
          console.error('Error parsing Gemini response:', parseError);
          throw new Error('Failed to parse resource recommendations');
        }

        // Validar la estructura de la respuesta
        if (!parsed.categories || !Array.isArray(parsed.categories)) {
          throw new Error('Invalid response structure');
        }

        localStorage.setItem(cachedKey, JSON.stringify(parsed));
        setResources(parsed);

      } catch (err) {
        console.error('Error fetching resources:', err);
        setError(err instanceof Error ? err.message : 'Error fetching resource recommendations');
        
        // Establecer recursos por defecto en caso de error
        setResources({
          categories: [
            {
              category: "Essential Learning Tools",
              description: "Core resources for language development",
              resources: [
                {
                  name: "Language Learning Apps",
                  description: "Popular mobile applications for daily practice",
                  type: "app",
                  focus: ["vocabulary", "grammar", "practice"]
                }
              ]
            }
          ]
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchResources();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentData.Nombre, studentData["Apellido(s)"]]);

  return { resources, isLoading, error };
};

export default useGeminiResources;