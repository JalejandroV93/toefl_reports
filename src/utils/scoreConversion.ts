import { Level } from "@/types";
export const SKILL_LEVELS = {
  READING: [
    { min: 29, max: 30, level: "C2" },
    { min: 24, max: 28, level: "C1" },
    { min: 18, max: 23, level: "B2" },
    { min: 4, max: 17, level: "B1" },
    { min: 0, max: 3, level: "A2" },
  ],
  LISTENING: [
    { min: 28, max: 30, level: "C2" },
    { min: 22, max: 27, level: "C1" },
    { min: 17, max: 21, level: "B2" },
    { min: 9, max: 16, level: "B1" },
    { min: 0, max: 8, level: "A2" },
  ],
  SPEAKING: [
    { min: 28, max: 30, level: "C2" },
    { min: 25, max: 27, level: "C1" },
    { min: 20, max: 24, level: "B2" },
    { min: 16, max: 19, level: "B1" },
    { min: 0, max: 15, level: "A2" },
  ],
  WRITING: [
    { min: 29, max: 30, level: "C2" },
    { min: 24, max: 28, level: "C1" },
    { min: 17, max: 23, level: "B2" },
    { min: 13, max: 16, level: "B1" },
    { min: 0, max: 12, level: "A2" },
  ],
};

export const TOTAL_SCORE_LEVELS = [
  { min: 114, max: 120, level: "C2" },
  { min: 95, max: 113, level: "C1" },
  { min: 72, max: 94, level: "B2" },
  { min: 42, max: 71, level: "B1" },
  { min: 0, max: 41, level: "A2" },
];

export function calculateTotalScore(scores: {
  READING: number;
  LISTENING: number;
  SPEAKING: number;
  WRITING: number;
}) {
  return scores.READING + scores.LISTENING + scores.SPEAKING + scores.WRITING;
}

export function getTotalLevel(totalScore: number) {
  if (totalScore >= 114) return "C2";
  if (totalScore >= 95) return "C1";
  if (totalScore >= 72) return "B2";
  if (totalScore >= 42) return "B1";
  return "A2";
}

export function getLevelForScore(score: number, skill: string): Level {
  const skillLevels = SKILL_LEVELS[skill as keyof typeof SKILL_LEVELS];

  if (!skillLevels) {
    throw new Error(`Invalid skill: ${skill}`);
  }

  for (const levelRange of skillLevels) {
    if (score >= levelRange.min && score <= levelRange.max) {
      return levelRange.level as Level;
    }
  }

  return "A2"; // Default level if no range matches
}
