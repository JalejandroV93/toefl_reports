import { Skill } from '@/types';

export type Level = 'C1' | 'B2' | 'B1' | 'A2' | 'Below';

export const getLevelForScore = (score: number): Level => {
  if (score >= 80) return 'C1';
  if (score >= 60) return 'B2';
  if (score >= 40) return 'B1';
  if (score >= 20) return 'A2';
  return 'Below';
};

export const getNextLevel = (currentLevel: Level): Level => {
  const levels: Level[] = ['Below', 'A2', 'B1', 'B2', 'C1'];
  const currentIndex = levels.indexOf(currentLevel);
  return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : currentLevel;
};

export const getSkillAnalysis = (skill: string, score: number): string => {
  const level = getLevelForScore(score);
  
  const analyses = {
    READING: {
      C1: "Advanced reading comprehension. Can handle complex academic texts.",
      B2: "Good comprehension of advanced texts. Some difficulty with technical vocabulary.",
      B1: "Basic comprehension of general texts. Needs improvement in speed and vocabulary.",
      A2: "Limited reading comprehension. Needs development of reading strategies.",
      Below: "Requires intensive support in reading comprehension."
    },
    LISTENING: {
      C1: "Excellent listening comprehension in various contexts.",
      B2: "Good comprehension in most situations.",
      B1: "Moderate comprehension. Difficulties with accents and speed.",
      A2: "Basic comprehension. Needs more exposure to listening materials.",
      Below: "Requires intensive practice in listening comprehension."
    },
    SPEAKING: {
      C1: "Fluent and natural communication in various contexts.",
      B2: "Good fluency with minor errors.",
      B1: "Basic effective communication. Needs to improve fluency.",
      A2: "Limited communication abilities. Requires more oral practice.",
      Below: "Needs intensive development of speaking skills."
    },
    WRITING: {
      C1: "Excellent written expression across various genres.",
      B2: "Good writing ability with clear structure.",
      B1: "Basic effective writing. Needs improvement in organization.",
      A2: "Limited writing ability. Requires development of structure.",
      Below: "Needs intensive support in written expression."
    }
  };

  return analyses[skill as keyof typeof analyses]?.[level] || "Analysis not available";
};

export const getRecommendedActivities = (skill: Skill, score: number): string[] => {
  const level = getLevelForScore(score);
  
  const activities: Record<Skill, Record<Level, string[]>> = {
    READING: {
      Below: [
        "Practice basic sight words daily",
        "Use graded readers at beginner level",
        "Work with simplified texts and comprehension exercises"
      ],
      A2: [
        "Read short articles with guided questions",
        "Practice identifying main ideas",
        "Use vocabulary flashcards regularly"
      ],
      B1: [
        "Read news articles daily",
        "Practice skimming and scanning",
        "Work on academic vocabulary"
      ],
      B2: [
        "Read academic papers",
        "Practice critical analysis",
        "Work on advanced vocabulary"
      ],
      C1: [
        "Read complex academic texts",
        "Analyze research papers",
        "Practice speed reading"
      ]
    },
    LISTENING: {
      Below: [
        "Listen to basic English dialogues",
        "Practice with slow-speed audio",
        "Use subtitled videos for support"
      ],
      A2: [
        "Watch educational videos with subtitles",
        "Practice with short dialogues",
        "Listen to slow-paced podcasts"
      ],
      B1: [
        "Watch news broadcasts",
        "Practice note-taking",
        "Listen to academic lectures"
      ],
      B2: [
        "Attend online lectures",
        "Practice with various accents",
        "Take detailed notes"
      ],
      C1: [
        "Listen to complex academic content",
        "Practice with fast-paced content",
        "Work with technical presentations"
      ]
    },
    SPEAKING: {
      Below: [
        "Practice basic pronunciation daily",
        "Record simple sentences",
        "Work with a language partner on basics"
      ],
      A2: [
        "Participate in basic conversations",
        "Practice common phrases",
        "Record short descriptions"
      ],
      B1: [
        "Join conversation groups",
        "Give short presentations",
        "Practice expressing opinions"
      ],
      B2: [
        "Participate in debates",
        "Give academic presentations",
        "Practice impromptu speaking"
      ],
      C1: [
        "Lead academic discussions",
        "Give complex presentations",
        "Practice public speaking"
      ]
    },
    WRITING: {
      Below: [
        "Practice basic sentence structure",
        "Write simple sentences daily",
        "Work on basic grammar exercises"
      ],
      A2: [
        "Write short paragraphs",
        "Practice basic essay structure",
        "Work on connecting ideas"
      ],
      B1: [
        "Write basic essays",
        "Practice paragraph organization",
        "Work on coherence"
      ],
      B2: [
        "Write academic essays",
        "Practice argumentation",
        "Work on advanced grammar"
      ],
      C1: [
        "Write research papers",
        "Develop complex arguments",
        "Practice academic writing"
      ]
    }
  };

  return activities[skill]?.[level] || [
    "Practice regularly with structured materials",
    "Work with a language tutor",
    "Focus on foundational skills"
  ];
};