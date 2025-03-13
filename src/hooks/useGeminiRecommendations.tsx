// src/hooks/useGeminiRecommendations.tsx
"use client";
import { useState, useEffect } from "react";
import { StudentData } from "@/types";
import { SkillRecommendation, Recommendations } from "@/types/recommendations";

export const useGeminiRecommendations = (studentData: StudentData) => {
  const [recommendations, setRecommendations] = useState<Recommendations>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/gemini/individual-recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentData }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          setRecommendations(data.data);
        } else {
          throw new Error(data.error || "Failed to fetch recommendations");
        }
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        setError(
          err instanceof Error ? err.message : "Error fetching recommendations"
        );
        setRecommendations(getDefaultRecommendations());
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentData.Nombre, studentData["Apellido(s)"]]); // Correct dependency

  return { recommendations, isLoading, error };
};

const getDefaultRecommendations = (): Recommendations => {
  const defaultRec: SkillRecommendation = {
    strengths: ["Basic understanding established"],
    weaknesses: ["Needs consistent practice"],
    shortTermActions: [
      "Practice with TOEFL materials daily",
      "Work on core skills",
      "Use study resources regularly",
    ],
    longTermStrategy: [
      "Develop study routine",
      "Track progress regularly",
      "Seek feedback on improvements",
    ],
    resources: ["Official TOEFL materials", "Practice tests", "Study groups"],
  };

  return {
    READING: { ...defaultRec },
    LISTENING: { ...defaultRec },
    SPEAKING: { ...defaultRec },
    WRITING: { ...defaultRec },
  };
};
export default useGeminiRecommendations;
