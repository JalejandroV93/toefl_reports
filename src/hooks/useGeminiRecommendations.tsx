import { useState, useEffect } from 'react';
import { StudentData } from '@/types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getLevelForScore } from '@/utils/skillAnalysisUtils';

interface GeminiResponse {
  recommendations: string[];
}

export const useGeminiRecommendations = (studentData: StudentData) => {
  const [recommendations, setRecommendations] = useState<{ [key: string]: string[] }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      const cachedKey = `gemini-recommendations-${studentData.Nombre}-${studentData["Apellido(s)"]}`;
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
        const newRecommendations: { [key: string]: string[] } = {};

        // Process Speaking and Writing in parallel
        const skills = ['Speaking', 'Writing'];
        const promises = skills.map(async (skill) => {
          const upperSkill = skill.toUpperCase();
          const score = studentData[upperSkill as keyof StudentData] as number;
          const level = getLevelForScore(score);
          const feedback = studentData[`FEEDBACK ${upperSkill}` as keyof StudentData];
          
          if (feedback) {
            const prompt = `
              Analyze this ${skill} feedback and score for a TOEFL student and generate recommendations.
              Score: ${score}/100 (Level: ${level})
              Feedback: ${feedback}

              Generate ONLY a JSON response with this exact structure:
              {
                "recommendations": [
                  "4-6 specific recommendations in English",
                  "Include both strengths and areas for improvement",
                  "Be specific and actionable",
                  "Consider the student's current level"
                ]
              }

              Important:
              - ALL recommendations must be in English
              - Be specific to the skill and level
              - Include immediate actions they can take
              - Focus on practical improvements
              - Consider both strengths and weaknesses
            `;

            const result = await model.generateContent(prompt);
            const text = result.response.text();
            const cleanText = text.replace(/```json\n|\n```/g, '').trim();
            const parsed = JSON.parse(cleanText) as GeminiResponse;
            return { skill, recommendations: parsed.recommendations };
          }
          
          // Default recommendations if no feedback is available
          return { 
            skill, 
            recommendations: getDefaultRecommendations(skill, score) 
          };
        });

        const results = await Promise.all(promises);
        results.forEach(({ skill, recommendations }) => {
          newRecommendations[skill] = recommendations;
        });

        localStorage.setItem(cachedKey, JSON.stringify(newRecommendations));
        setRecommendations(newRecommendations);

      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError(err instanceof Error ? err.message : 'Error fetching recommendations');
        
        // Set default recommendations for both skills
        const defaultRecs = {
          Speaking: getDefaultRecommendations('Speaking', studentData.SPEAKING),
          Writing: getDefaultRecommendations('Writing', studentData.WRITING)
        };
        setRecommendations(defaultRecs);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentData.Nombre, studentData["Apellido(s)"], studentData.SPEAKING, studentData.WRITING]);

  const clearCache = () => {
    const cachedKey = `gemini-recommendations-${studentData.Nombre}-${studentData["Apellido(s)"]}`;
    localStorage.removeItem(cachedKey);
  };

  return {
    recommendations,
    isLoading,
    error,
    clearCache,
  };
};

const getDefaultRecommendations = (skill: string, score: number): string[] => {
  const level = getLevelForScore(score);
  
  const defaultRecs = {
    Speaking: {
      Below: [
        "Practice basic pronunciation with online tools daily",
        "Work with a language tutor on fundamental speaking skills",
        "Record and listen to basic conversations",
        "Focus on common everyday phrases"
      ],
      A2: [
        "Participate in basic conversation practice sessions",
        "Use language learning apps for pronunciation",
        "Practice describing simple situations and objects",
        "Work on basic question and answer patterns"
      ],
      B1: [
        "Join English conversation groups",
        "Practice speaking with language exchange partners",
        "Work on fluency through short presentations",
        "Improve pronunciation of academic vocabulary"
      ],
      B2: [
        "Participate in academic discussions",
        "Give presentations on complex topics",
        "Work on impromptu speaking skills",
        "Practice debate techniques"
      ],
      C1: [
        "Lead academic discussions and seminars",
        "Give detailed presentations on specialized topics",
        "Work on advanced rhetorical techniques",
        "Practice public speaking in academic contexts"
      ]
    },
    Writing: {
      Below: [
        "Practice basic sentence construction daily",
        "Work on fundamental grammar exercises",
        "Focus on building basic vocabulary",
        "Practice writing simple descriptions"
      ],
      A2: [
        "Write short paragraphs on familiar topics",
        "Practice basic essay structure",
        "Work on connecting sentences logically",
        "Focus on common writing patterns"
      ],
      B1: [
        "Write structured essays on general topics",
        "Practice academic paragraph organization",
        "Work on thesis statement development",
        "Improve vocabulary usage in writing"
      ],
      B2: [
        "Write academic essays with clear arguments",
        "Practice advanced grammar structures",
        "Work on academic writing style",
        "Develop research writing skills"
      ],
      C1: [
        "Write complex academic papers",
        "Develop sophisticated arguments",
        "Master academic writing conventions",
        "Practice writing for publication"
      ]
    }
  };

  return defaultRecs[skill as keyof typeof defaultRecs]?.[level] || [
    `Focus on improving basic ${skill.toLowerCase()} skills`,
    "Work with a language tutor regularly",
    "Practice with structured learning materials",
    "Set specific learning goals and track progress"
  ];
};

export default useGeminiRecommendations;