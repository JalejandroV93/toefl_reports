"use client";
import { useState, useEffect, useMemo } from "react"; // Import useMemo
import { ChartData } from "@/types";

export interface GeminiResponse {
  shortTermActions: string[];
  longTermStrategy: string[];
}

// Add optional initialRecommendations parameter
export const useGeminiGeneralRecommendations = (
  distributionData: ChartData[],
  initialRecommendations?: GeminiResponse // Add this
) => {
  const [recommendations, setRecommendations] = useState<GeminiResponse>(
    initialRecommendations || { shortTermActions: [], longTermStrategy: [] } // Initialize with initial data
  );
  const [isLoading, setIsLoading] = useState(!initialRecommendations); // Only load if no initial data
  const [error, setError] = useState<string | null>(null);

  // Use useMemo to prevent unnecessary recalculation of the dependency array
  const memoizedDistributionData = useMemo(
    () => distributionData,
    [distributionData]
  );

  useEffect(() => {
    // Only fetch if no initial recommendations were provided
    if (!initialRecommendations) {
      const fetchRecommendations = async () => {
        setIsLoading(true);
        setError(null);

        try {
          const response = await fetch("/api/gemini/general-recommendations", {
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
            setRecommendations(data.data);
          } else {
            throw new Error(data.error || "Failed to fetch recommendations");
          }
        } catch (err) {
          console.error("Error fetching recommendations:", err);
          setError(
            err instanceof Error
              ? err.message
              : "Error fetching recommendations"
          );
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
    }
  }, [memoizedDistributionData, initialRecommendations]); // Add initialRecommendations to dependency array

  return { recommendations, isLoading, error };
};

export default useGeminiGeneralRecommendations;
