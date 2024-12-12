// // types/index.ts

// export interface StudentData {
//     Nombre: string;
//     'Apellido(s)': string;
//     READING: number;
//     LISTENING: number;
//     SPEAKING: number;
//     'FEEDBACK SPEAKING': string;
//     WRITING: number;
//     'FEEDBACK WRITING': string;
//   }
  
//   export interface SkillScore {
//     skill: string;
//     score: number;
//   }
  
//   export interface RadarDataPoint {
//     subject: string;
//     score: number;
//     fullMark: number;
//   }
  
//   export interface ChartData {
//     skill: string;
//     C1: number;
//     B2: number;
//     B1: number;
//     A2: number;
//     Below: number;
//     average?: number;
//   }
  
//   export interface LevelDistribution {
//     C1: number;
//     B2: number;
//     B1: number;
//     A2: number;
//     Below: number;
//     total: number;
//     average: number;
//   }
  
//   export interface SkillLevelMapping {
//     [key: string]: LevelDistribution;
//   }
  
//   export const SKILL_LEVELS = {
//     C1: { min: 80, max: 100, label: 'Advanced (C1)' },
//     B2: { min: 60, max: 79, label: 'High Intermediate (B2)' },
//     B1: { min: 40, max: 59, label: 'Low Intermediate (B1)' },
//     A2: { min: 0, max: 39, label: 'Basic (A2)' },
//     Below: { min: 0, max: 0, label:'Below A2' }
//   } as const;
  
//   export const SKILLS = ['READING', 'LISTENING', 'SPEAKING', 'WRITING'] as const;
  
//   export type Skill = typeof SKILLS[number];
//   export type Level = keyof typeof SKILL_LEVELS;
  
  export interface ReportGenerationOptions {
    includeRecommendations?: boolean;
    includeCharts?: boolean;
    format: 'pdf' | 'txt';
  }

// types/index.ts
export interface StudentData {
    Nombre: string;
    'Apellido(s)': string;
    READING: number;
    LISTENING: number;
    SPEAKING: number;
    'FEEDBACK SPEAKING': string;
    WRITING: number;
    'FEEDBACK WRITING': string;
  }
  
  export interface LevelDistribution {
    C1: number;
    B2: number;
    B1: number;
    A2: number;
    Below: number;
    total: number;
    average: number;
  }
  
  export interface SkillLevelMapping {
    [key: string]: LevelDistribution;
  }
  
  export interface ChartData {
    skill: string;
    C1: number;
    B2: number;
    B1: number;
    A2: number;
    Below: number;
    average?: number;
  }
  
  export type Level = 'C1' | 'B2' | 'B1' | 'A2' | 'Below';
  
  export const SKILLS = ['READING', 'LISTENING', 'SPEAKING', 'WRITING'] as const;
  export type Skill = typeof SKILLS[number];