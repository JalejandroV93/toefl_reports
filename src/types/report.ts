// types/report.ts
export interface Student {
  id: string;
  name: string;
  lastName: string;
  shareToken: string;
  reading: number;
  listening: number;
  speaking: number;
  writing: number;
  speakingFeedback?: string;
  writingFeedback?: string;
}

export interface Report {
  id: string;
  createdAt: Date;
  group: string;
  shareToken: string;
  students: Student[];
  recommendations: string;
  distribution: string;
}