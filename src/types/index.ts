export interface ReportGenerationOptions {
  includeRecommendations?: boolean;
  includeCharts?: boolean;
  format: "pdf" | "txt";
}

// types/index.ts
export interface StudentData {
  Nombre: string;
  "Apellido(s)": string;
  READING: number;
  LISTENING: number;
  SPEAKING: number;
  "FEEDBACK SPEAKING": string;
  WRITING: number;
  "FEEDBACK WRITING": string;
}

export interface LevelDistribution {
  C2: number;
  C1: number;
  B2: number;
  B1: number;
  A2: number;
  total: number;
  average: number;
}

export interface SkillLevelMapping {
  [key: string]: LevelDistribution;
}

export interface ChartData {
  skill: string;
  C2: number;
  C1: number;
  B2: number;
  B1: number;
  A2: number;
  average?: number;
}

export interface ExecutiveSummaryProps {
  studentsCount: number;
  distributionData: ChartData[];
  highestPerformanceSkill: string;
  lowestPerformanceSkill: string;
}

export type Level = "C2" | "C1" | "B2" | "B1" | "A2";

export const SKILLS = ["READING", "LISTENING", "SPEAKING", "WRITING"] as const;
export type Skill = (typeof SKILLS)[number];
