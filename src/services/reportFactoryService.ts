// services/reportFactoryService.ts
import { StudentData, ChartData } from "@/types";
//import { GoogleGenerativeAI } from "@google/generative-ai";  <-- Remove this
import { calculateLevelDistribution } from "@/utils/reportUtils";
//import { getLevelForScore } from "@/utils/scoreConversion"; <-- Remove this
import { Subject } from "rxjs";
import { GeminiRateLimiter, geminiRateLimiter } from "./geminiRateLimiter";

export interface GenerationProgress {
  stage: "general" | "individual" | "analysis";
  current: number;
  total: number;
  estimatedWaitTime: number;
}

export class ReportFactoryService {
  //private readonly API_KEY: string; <-- Remove
  private progressSubject = new Subject<GenerationProgress>();
  private rateLimiter: GeminiRateLimiter;

  constructor() {
    //const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY; <-- Remove
    //if (!apiKey) {
    //  throw new Error("Gemini API key not found");
    //}
    //this.API_KEY = apiKey;
    this.rateLimiter = geminiRateLimiter;
  }

  get progressObservable() {
    return this.progressSubject.asObservable();
  }

  private async generateWithRateLimiter<T>(
    stage: GenerationProgress["stage"],
    current: number,
    total: number,
    generator: () => Promise<T>
  ): Promise<T> {
    const waitTime = this.rateLimiter.getEstimatedWaitTime();
    this.progressSubject.next({
      stage,
      current,
      total,
      estimatedWaitTime: waitTime,
    });

    return await this.rateLimiter.enqueue(generator);
  }

  private async generateGeneralRecommendations(distributionData: ChartData[]) {
    return this.generateWithRateLimiter("general", 1, 1, async () => {
      try {
        const response = await fetch("/api/gemini/general-recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ distributionData }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
          return data.data;
        } else {
          // IMPORTANT: Return default recommendations on failure
          console.error(
            "Gemini API failed (general recommendations):",
            data.error
          ); // Log the specific error
          return this.getDefaultGeneralRecommendations();
        }
      } catch (error) {
        console.error("Error generating general recommendations:", error);
        return this.getDefaultGeneralRecommendations(); // Return defaults
      }
    });
  }

  private async generateIndividualRecommendations(
    studentData: StudentData,
    index: number,
    total: number
  ) {
    return this.generateWithRateLimiter(
      "individual",
      index + 1,
      total,
      async () => {
        try {
          const response = await fetch(
            "/api/gemini/individual-recommendations",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ studentData }),
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const data = await response.json();
          if (data.success) {
            return data.data;
          } else {
            // IMPORTANT: Return default recommendations on failure
            console.error(
              "Gemini API failed (individual recommendations):",
              data.error
            );
            return this.getDefaultIndividualRecommendations();
          }
        } catch (error) {
          console.error("Error generating individual recommendations:", error);
          return this.getDefaultIndividualRecommendations(); // Return defaults
        }
      }
    );
  }

  private async generateSkillAnalysis(distributionData: ChartData[]) {
    return this.generateWithRateLimiter("analysis", 1, 1, async () => {
      try {
        const response = await fetch("/api/gemini/skill-analysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ distributionData }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
          return data.data;
        } else {
          // IMPORTANT: Return default analysis on failure
          console.error("Gemini API failed (skill analysis):", data.error);
          return this.getDefaultSkillAnalysis();
        }
      } catch (error) {
        console.error("Error generating skill analysis:", error);
        return this.getDefaultSkillAnalysis(); // Return defaults
      }
    });
  }

  private getDefaultGeneralRecommendations() {
    return {
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
    };
  }

  private getDefaultIndividualRecommendations() {
    const defaultSkill = {
      strengths: ["Basic understanding established"],
      weaknesses: ["Needs consistent practice"],
      shortTermActions: [
        "Practice with TOEFL materials daily",
        "Work on core skills",
        "Use study resources regularly",
      ],
      longTermStrategy: [
        "Develop consistent study routine",
        "Track progress systematically",
        "Seek regular feedback on improvements",
      ],
    };

    return {
      READING: { ...defaultSkill },
      LISTENING: { ...defaultSkill },
      SPEAKING: { ...defaultSkill },
      WRITING: { ...defaultSkill },
    };
  }

  private getDefaultSkillAnalysis() {
    const defaultAnalysis = {
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
      skillAnalysis: {
        Reading: { ...defaultAnalysis },
        Listening: { ...defaultAnalysis },
        Speaking: { ...defaultAnalysis },
        Writing: { ...defaultAnalysis },
      },
    };
  }

  async generateReportData(studentsData: StudentData[]) {
    const distributionData = calculateLevelDistribution(studentsData);

    // Generate general recommendations and skill analysis in parallel
    const [generalRecommendations, skillAnalysis] = await Promise.all([
      this.generateGeneralRecommendations(distributionData),
      this.generateSkillAnalysis(distributionData),
    ]);

    // Generate individual recommendations sequentially
    const individualRecommendations = [];
    for (let i = 0; i < studentsData.length; i++) {
      const recommendations = await this.generateIndividualRecommendations(
        studentsData[i],
        i,
        studentsData.length
      );
      individualRecommendations.push(recommendations);
    }

    //add the resources for each student
    for (let i = 0; i < studentsData.length; i++) {
      try {
        const response = await fetch("/api/gemini/resources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentData: studentsData[i] }),
        });

        if (!response.ok) {
          // IMPORTANT: Don't throw here.  Log the error and continue.
          console.error(
            `HTTP error fetching resources for student ${i}! Status: ${response.status}`
          );
          continue; // Skip to the next student
        }
        const data = await response.json();

        if (data.success) {
          // Assuming your individual recommendations have a 'resources' field
          if (individualRecommendations[i]) {
            individualRecommendations[i].resources = data.data.categories;
          }
        } else {
          console.warn(`Failed to get resources for student ${i}:`, data.error);
          // IMPORTANT:  Don't throw. Log and continue.
        }
      } catch (error) {
        console.error(`Error fetching resources for student ${i}:`, error);
        // IMPORTANT:  Don't throw. Log and continue.
      }
    }

    return {
      distribution: distributionData,
      recommendations: {
        general: generalRecommendations,
        individual: individualRecommendations,
      },
      analysis: skillAnalysis,
    };
  }
}

export const reportFactoryService = new ReportFactoryService();
