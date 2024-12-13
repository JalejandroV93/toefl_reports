import { StudentData } from "./";
export interface SkillRecommendation {
    strengths: string[];
    weaknesses: string[];
    shortTermActions: string[];
    longTermStrategy: string[];
    resources: string[];
  }
  
  export interface Recommendations {
    [key: string]: SkillRecommendation;
  }
  
  export interface ActionPlanProps {
    studentData: StudentData;
  }