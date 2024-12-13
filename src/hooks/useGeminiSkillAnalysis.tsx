// hooks/useGeminiSkillAnalysis.tsx
import { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChartData } from '@/types';

interface SkillAnalysis {
  strengths: string[];
  improvements: string[];
}

interface SkillsAnalysis {
  [key: string]: SkillAnalysis;
}

export const useGeminiSkillAnalysis = (distributionData: ChartData[]) => {
  const [analysis, setAnalysis] = useState<SkillsAnalysis>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      const dataString = JSON.stringify(distributionData);
      const cachedKey = `gemini-skill-analysis-${dataString}`;
      const cached = localStorage.getItem(cachedKey);

      if (cached) {
        setAnalysis(JSON.parse(cached));
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
              "strengths": [
                "3-4 specific strengths based on the data",
                "focus on concrete observations",
                "highlight positive patterns"
              ],
              "improvements": [
                "3-4 specific areas needing improvement",
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
        const cleanText = text.replace(/```json\n?|```/g, '').trim();
        const parsed = JSON.parse(cleanText) as SkillsAnalysis;

        localStorage.setItem(cachedKey, JSON.stringify(parsed));
        setAnalysis(parsed);
      } catch (err) {
        console.error('Error fetching skill analysis:', err);
        setError(err instanceof Error ? err.message : 'Error generating analysis');
        
        // Set default analysis in case of error
        setAnalysis(getDefaultAnalysis());
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(distributionData)]);

  return { analysis, isLoading, error };
};

const getDefaultAnalysis = (): SkillsAnalysis => {
  const defaultSkillAnalysis: SkillAnalysis = {
    strengths: [
      'Students show consistent participation',
      'Basic understanding established',
      'Foundation for improvement present'
    ],
    improvements: [
      'Need for more structured practice',
      'Focus on advanced skill development',
      'Strengthen core competencies'
    ]
  };

  return {
    Reading: { ...defaultSkillAnalysis },
    Listening: { ...defaultSkillAnalysis },
    Speaking: { ...defaultSkillAnalysis },
    Writing: { ...defaultSkillAnalysis }
  };
};

export default useGeminiSkillAnalysis;