// src/hooks/useGeminiResources.tsx
import { StudentData } from "@/types";
import { useEffect, useState } from "react";

export interface ResourceCategory {
  category: string;
  description: string;
  resources: {
    name: string;
    description: string;
    url?: string;
    type: "app" | "website" | "tool" | "practice" | "course";
    focus: string[];
  }[];
}

export interface ResourcesResponse {
  categories: ResourceCategory[];
}

export const useGeminiResources = (studentData: StudentData) => {
  const [resources, setResources] = useState<ResourcesResponse>({
    categories: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResources = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/gemini/resources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentData }),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
          setResources(data.data);
        } else {
          throw new Error(data.error || "Failed to fetch resources");
        }
      } catch (err) {
        console.error("Error fetching resources:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Error fetching resource recommendations"
        );
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
                  focus: ["vocabulary", "grammar", "practice"],
                },
              ],
            },
          ],
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
