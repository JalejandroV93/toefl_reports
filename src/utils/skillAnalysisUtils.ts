import { Skill } from "@/types";
import { getLevelForScore } from "@/utils/scoreConversion";

export type Level = "C2" | "C1" | "B2" | "B1" | "A2";

export const getNextLevel = (currentLevel: Level): Level => {
  const levels: Level[] = ["A2", "B1", "B2", "C1", "C2"];
  const currentIndex = levels.indexOf(currentLevel);
  return currentIndex < levels.length - 1
    ? levels[currentIndex + 1]
    : currentLevel;
};

export const getSkillAnalysis = (skill: string, score: number): string => {
  const level = getLevelForScore(score, skill);

  const analyses = {
    READING: {
      C2: "Exceptional comprehension of academic and professional texts, including nuanced meanings.",
      C1: "Strong comprehension of complex texts with occasional need for contextual clarification.",
      B2: "Good understanding of general and some technical texts. Struggles with highly specialized content.",
      B1: "Fair comprehension of straightforward texts. Challenges with abstract or idiomatic language.",
      A2: "Basic ability to understand short, simple texts with familiar vocabulary.",
  },
  LISTENING: {
      C2: "Understands a wide range of spoken language at natural speed, including abstract and technical content.",
      C1: "Can follow extended speech and complex arguments in various contexts with minimal difficulty.",
      B2: "Understands standard speech on familiar topics but may miss finer details or fast-paced dialogue.",
      B1: "Can grasp main points in clear, standard speech but struggles with detail and unfamiliar topics.",
      A2: "Understands slow, clear speech with simple vocabulary.",
  },
  SPEAKING: {
      C2: "Communicates fluently, accurately, and effectively in both formal and informal settings.",
      C1: "Speaks fluently with rare pauses, using a wide range of expressions and appropriate tone.",
      B2: "Expresses ideas clearly with good control of grammar, though with occasional errors.",
      B1: "Can handle basic interactions with limited fluency and control over more complex ideas.",
      A2: "Produces simple phrases and sentences. Struggles to maintain longer conversations.",
  },
  WRITING: {
      C2: "Produces well-structured, detailed texts in any genre with natural use of language.",
      C1: "Writes clear, detailed texts on complex topics, using appropriate tone and vocabulary.",
      B2: "Writes structured texts with clarity, though errors in grammar and vocabulary persist.",
      B1: "Can write simple connected texts on familiar topics with limited range and accuracy.",
      A2: "Writes short, basic texts using common expressions. Limited grammatical control.",
  },
  };

  return (
    analyses[skill as keyof typeof analyses]?.[level] ||
    "Analysis not available"
  );
};

export const getRecommendedActivities = (
  skill: Skill,
  score: number
): string[] => {
  const level = getLevelForScore(score, skill);

  const activities: Record<Skill, Record<Level, string[]>> = {
    READING: {
        
        A2: [
            "Read simple stories or articles with guided questions",
            "Practice identifying main ideas in short texts",
            "Use vocabulary flashcards for key terms",
        ],
        B1: [
            "Read simplified news articles daily",
            "Practice skimming and scanning for key details",
            "Expand vocabulary with topic-specific texts",
        ],
        B2: [
            "Read opinion pieces and editorials",
            "Practice critical analysis of arguments",
            "Work on understanding advanced vocabulary",
        ],
        C1: [
            "Read complex academic and technical texts",
            "Analyze arguments and infer implicit meanings",
            "Practice speed reading for comprehension",
        ],
        C2: [
            "Read advanced literature and specialized research papers",
            "Engage in detailed text analysis",
            "Explore nuanced literary and technical language",
        ],
    },
    LISTENING: {
        
        A2: [
            "Watch short videos with subtitles",
            "Practice understanding simple dialogues",
            "Listen to slow-paced podcasts on familiar topics",
        ],
        B1: [
            "Listen to news broadcasts with simplified language",
            "Practice taking notes on main ideas",
            "Engage with interviews or conversational podcasts",
        ],
        B2: [
            "Listen to academic lectures with subtitles",
            "Practice understanding various accents",
            "Take detailed notes from longer audio content",
        ],
        C1: [
            "Engage with fast-paced academic content",
            "Analyze complex arguments in spoken form",
            "Practice understanding technical presentations",
        ],
        C2: [
            "Listen to advanced professional discussions",
            "Analyze subtle differences in tone and nuance",
            "Engage with complex, multi-speaker dialogues",
        ],
    },
    SPEAKING: {
        
        A2: [
            "Participate in basic role-play conversations",
            "Practice using common phrases in everyday contexts",
            "Record short self-introductions or daily activities",
        ],
        B1: [
            "Join conversation groups to improve fluency",
            "Give short presentations on familiar topics",
            "Practice expressing opinions on everyday issues",
        ],
        B2: [
            "Engage in structured debates on current events",
            "Deliver detailed academic presentations",
            "Practice impromptu speaking with minimal preparation",
        ],
        C1: [
            "Lead discussions on professional or academic topics",
            "Give in-depth presentations with complex ideas",
            "Practice public speaking with an advanced audience",
        ],
        C2: [
            "Lead and moderate academic panels",
            "Deliver polished presentations on specialized topics",
            "Engage in persuasive speaking with expert audiences",
        ],
    },
    WRITING: {
        
        A2: [
            "Write short paragraphs about familiar topics",
            "Practice basic essay structure with simple connectors",
            "Work on combining sentences to connect ideas",
        ],
        B1: [
            "Write essays on general topics using clear structure",
            "Practice organizing ideas into cohesive paragraphs",
            "Focus on coherence and logical flow",
        ],
        B2: [
            "Write academic-style essays with supporting arguments",
            "Practice constructing complex sentences",
            "Work on advanced grammar and formal tone",
        ],
        C1: [
            "Develop research papers with detailed analysis",
            "Write complex arguments with critical perspectives",
            "Practice academic writing in various formats",
        ],
        C2: [
            "Produce professional-quality research papers",
            "Craft nuanced and well-structured arguments",
            "Refine academic writing for publication standards",
        ],
    },
};


  return (
    activities[skill]?.[level] || [
      "Practice regularly with structured materials",
      "Work with a language tutor",
      "Focus on foundational skills",
    ]
  );
};
