// hooks/useGeminiRecommendations.tsx
import { useState, useEffect } from 'react';
import { StudentData } from '@/types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getLevelForScore } from '@/utils/skillAnalysisUtils';
import { SkillRecommendation, Recommendations } from '@/types/recommendations';

export const useGeminiRecommendations = (studentData: StudentData) => {
  const [recommendations, setRecommendations] = useState<Recommendations>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      const cachedKey = `gemini-recommendations-${studentData.Nombre}-${studentData["Apellido(s)"]}-v3`;
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
          throw new Error('Gemini API key not found');
        }

        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        
        // Preparar datos para el prompt
        const skillsData = {
          READING: {
            score: studentData.READING,
            level: getLevelForScore(studentData.READING)
          },
          LISTENING: {
            score: studentData.LISTENING,
            level: getLevelForScore(studentData.LISTENING)
          },
          SPEAKING: {
            score: studentData.SPEAKING,
            level: getLevelForScore(studentData.SPEAKING),
            feedback: studentData['FEEDBACK SPEAKING']
          },
          WRITING: {
            score: studentData.WRITING,
            level: getLevelForScore(studentData.WRITING),
            feedback: studentData['FEEDBACK WRITING']
          }
        };

        const prompt = `
          Analyze this TOEFL student's performance and generate recommendations.
          Student Data: ${JSON.stringify(skillsData, null, 2)}

          For each skill (READING, LISTENING, SPEAKING, WRITING), provide specific recommendations in this exact format (do not include any markdown, code blocks, or other formatting):

          {
            "READING": {
              "strengths": ["strength1", "strength2"],
              "weaknesses": ["weakness1", "weakness2"],
              "shortTermActions": ["action1", "action2", "action3"],
              "longTermStrategy": ["strategy1", "strategy2", "strategy3"],
              "resources": ["resource1", "resource2", "resource3"]
            },
            "LISTENING": {same structure},
            "SPEAKING": {same structure},
            "WRITING": {same structure}
          }

          Guidelines:
          - Base recommendations on score and level
          - For Speaking and Writing, analyze the feedback provided
          - All recommendations should be specific and actionable
          - Avoid general advice, focus on TOEFL-specific improvements
          - Include only the JSON response, no additional text or formatting
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        
        // Limpiar la respuesta de cualquier formato markdown
        const cleanText = text
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .replace(/^\s*{\s*/, '{')
          .replace(/\s*}\s*$/, '}')
          .trim();

        try {
          const parsed = JSON.parse(cleanText) as Recommendations;
          localStorage.setItem(cachedKey, JSON.stringify(parsed));
          setRecommendations(parsed);
        } catch (parseError) {
          console.error("Error parsing Gemini response:", parseError);
          console.log("Raw response:", text);
          console.log("Cleaned response:", cleanText);
          throw new Error("Failed to parse Gemini response");
        }
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError(err instanceof Error ? err.message : 'Error fetching recommendations');
        setRecommendations(getDefaultRecommendations());
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentData.Nombre, studentData["Apellido(s)"]]);

  return { recommendations, isLoading, error };
};

const getDefaultRecommendations = (): Recommendations => {
  const defaultRec: SkillRecommendation = {
    strengths: ['Basic understanding established'],
    weaknesses: ['Needs consistent practice'],
    shortTermActions: [
      'Practice with TOEFL materials daily',
      'Work on core skills',
      'Use study resources regularly'
    ],
    longTermStrategy: [
      'Develop study routine',
      'Track progress regularly',
      'Seek feedback on improvements'
    ],
    resources: [
      'Official TOEFL materials',
      'Practice tests',
      'Study groups'
    ]
  };

  return {
    READING: { ...defaultRec },
    LISTENING: { ...defaultRec },
    SPEAKING: { ...defaultRec },
    WRITING: { ...defaultRec }
  };
};

export default useGeminiRecommendations;