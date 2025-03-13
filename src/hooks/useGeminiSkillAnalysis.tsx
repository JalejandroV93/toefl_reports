"use client";
import { useState, useEffect, useMemo } from "react"; // Import useMemo
import { ChartData } from "@/types";

interface SkillAnalysis {
  strengths: string[];
  improvements: string[];
}

export interface SkillsAnalysis {
  [key: string]: SkillAnalysis;
}

// Add optional initialAnalysis parameter
export const useGeminiSkillAnalysis = (
  distributionData: ChartData[],
  initialAnalysis?: SkillsAnalysis // Add this
) => {
  const [analysis, setAnalysis] = useState<SkillsAnalysis>(
    initialAnalysis || {}
  ); // Initialize with initial data
  const [isLoading, setIsLoading] = useState(!initialAnalysis); // Only load if no initial data
  const [error, setError] = useState<string | null>(null);

  // Use useMemo
  const memoizedDistributionData = useMemo(
    () => distributionData,
    [distributionData]
  );

  useEffect(() => {
    // Only fetch if no initial analysis was provided
    if (!initialAnalysis) {
      const fetchAnalysis = async () => {
        setIsLoading(true);
        setError(null);

        try {
          const response = await fetch("/api/gemini/skill-analysis", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              distributionData: memoizedDistributionData,
            }), // Use memoized data
          });

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const data = await response.json();
          if (data.success) {
            setAnalysis(data.data);
          } else {
            throw new Error(data.error || "Failed to fetch skill analysis");
          }
        } catch (err) {
          console.error("Error fetching skill analysis:", err);
          setError(
            err instanceof Error ? err.message : "Error generating analysis"
          );
          setAnalysis(getDefaultAnalysis());
        } finally {
          setIsLoading(false);
        }
      };

      fetchAnalysis();
    }
  }, [memoizedDistributionData, initialAnalysis]); // Add initialAnalysis to dependency array

  return { analysis, isLoading, error };
};

const getDefaultAnalysis = (): SkillsAnalysis => {
  const defaultSkillAnalysis: SkillAnalysis = {
    strengths: [
      "Students show consistent participation",
      "Basic understanding established",
      "Foundation for improvement present",
    ],
    improvements: [
      "Need for more structured practice",
      "Focus on advanced skill development",
      "Strengthen core competencies",
    ],
  };

  return {
    Reading: { ...defaultSkillAnalysis },
    Listening: { ...defaultSkillAnalysis },
    Speaking: { ...defaultSkillAnalysis },
    Writing: { ...defaultSkillAnalysis },
  };
};

export default useGeminiSkillAnalysis;
