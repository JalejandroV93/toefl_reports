// types/report.ts
// export interface Student {
//   id: string;
//   name: string;
//   lastName: string;
//   shareToken: string;
//   reading: number;
//   listening: number;
//   speaking: number;
//   writing: number;
//   speakingFeedback?: string;
//   writingFeedback?: string;
// }

export interface Student {
  id: string;
  name: string;
  lastName: string;
  reading: number;
  listening: number;
  speaking: number;
  writing: number;
  speakingFeedback?: string | null;
  writingFeedback?: string | null;
  shareToken: string;
  recommendations: string;
  report: {
    group: string;
    createdAt: Date;
  };
}
export interface Report {
  id: string;
  createdAt: Date;
  group: string;
  shareToken: string;
  recommendations: string;
  distribution: string;
  analysis: string | null;
  students: Student[];
}