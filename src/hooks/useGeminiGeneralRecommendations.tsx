// hooks/useGeminiGeneralRecommendations.tsx
import { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChartData } from "@/types";

interface GeminiResponse {
  shortTermActions: string[];
  longTermStrategy: string[];
}

export const useGeminiGeneralRecommendations = (
  distributionData: ChartData[]
) => {
  const [recommendations, setRecommendations] = useState<GeminiResponse>({
    shortTermActions: [],
    longTermStrategy: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
   // const dataString = JSON.stringify(distributionData);
    const fetchRecommendations = async () => {
      const dataString = JSON.stringify(distributionData);
      const cachedKey = `gemini-general-recommendations-${dataString}`;
      const cached = localStorage.getItem(cachedKey);

      if (cached) {
        setRecommendations(JSON.parse(cached));
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!API_KEY) {
          throw new Error("Gemini API key not found");
        }

        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({
          model: "gemini-2.0-flash-exp",
        });

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
        const parsed = JSON.parse(cleanText) as GeminiResponse;

        localStorage.setItem(cachedKey, JSON.stringify(parsed));
        setRecommendations(parsed);
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        setError(
          err instanceof Error ? err.message : "Error fetching recommendations"
        );

        // Establecer recomendaciones por defecto en caso de error
        setRecommendations({
          shortTermActions: [
            "Implement intensive practice for lowest-performing skills",
            "Develop structured assessment program",
            "Create skill-specific study groups",
            "Provide targeted resources for weak areas",
          ],
          longTermStrategy: [
            "Establish regular progress monitoring system",
            "Develop comprehensive curriculum alignment",
            "Create personalized learning pathways",
            "Implement integrated skills approach",
          ],
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecommendations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(distributionData)]);
  //}, [distributionData]);
  //
  return { recommendations, isLoading, error };
};

export default useGeminiGeneralRecommendations;
