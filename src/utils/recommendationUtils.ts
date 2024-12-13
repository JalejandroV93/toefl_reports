// utils/recommendationUtils.ts
import { StudentData } from '@/types';
import { getLevelForScore } from '@/utils/reportUtils';

interface SkillRecommendation {
  strength: string[];
  improvement: string[];
  activities: string[];
  resources: string[];
}

export interface PersonalizedRecommendations {
  [key: string]: SkillRecommendation;
}

// Analiza el feedback para identificar patrones específicos
const analyzeFeedback = (feedback: string): { strengths: string[], weaknesses: string[] } => {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  
  // Palabras clave positivas y negativas para análisis
  const positiveKeywords = ['good', 'excellent', 'well', 'clear', 'strong', 'effective'];
  const negativeKeywords = ['need', 'should', 'improve', 'work on', 'lacking', 'difficult'];
  
  const sentences = feedback.toLowerCase().split(/[.!?]+/).filter(Boolean);
  
  sentences.forEach(sentence => {
    if (positiveKeywords.some(keyword => sentence.includes(keyword))) {
      strengths.push(sentence.trim());
    }
    if (negativeKeywords.some(keyword => sentence.includes(keyword))) {
      weaknesses.push(sentence.trim());
    }
  });
  
  return { strengths, weaknesses };
};

const getSkillSpecificActivities = (skill: string, score: number): string[] => {
  const level = getLevelForScore(score);
  const levelSpecificActivities = {
    C1: {
      READING: [
        'Analyze complex academic papers',
        'Practice speed reading with technical texts',
        'Review research methodologies'
      ],
      LISTENING: [
        'Take notes from complex lectures',
        'Practice with various accents',
        'Analyze academic discussions'
      ],
      SPEAKING: [
        'Lead academic discussions',
        'Give technical presentations',
        'Practice impromptu speeches'
      ],
      WRITING: [
        'Write research papers',
        'Develop complex arguments',
        'Practice academic writing'
      ]
    },
    B2: {
      READING: [
        'Read academic articles',
        'Practice timed reading',
        'Work on vocabulary in context'
      ],
      LISTENING: [
        'Watch academic lectures',
        'Take detailed notes',
        'Practice with different accents'
      ],
      SPEAKING: [
        'Give presentations',
        'Participate in debates',
        'Practice explaining concepts'
      ],
      WRITING: [
        'Write academic essays',
        'Practice argument development',
        'Focus on structure'
      ]
    },
    B1: {
      READING: [
        'Read news articles',
        'Practice comprehension strategies',
        'Build academic vocabulary'
      ],
      LISTENING: [
        'Watch educational videos',
        'Practice basic note-taking',
        'Listen to news broadcasts'
      ],
      SPEAKING: [
        'Practice conversations',
        'Record short presentations',
        'Work on pronunciation'
      ],
      WRITING: [
        'Write structured paragraphs',
        'Practice basic essays',
        'Focus on grammar'
      ]
    },
    A2: {
      READING: [
        'Read simplified texts',
        'Practice basic comprehension',
        'Build vocabulary'
      ],
      LISTENING: [
        'Watch videos with subtitles',
        'Practice with slow audio',
        'Focus on main ideas'
      ],
      SPEAKING: [
        'Practice basic phrases',
        'Work on pronunciation',
        'Use conversation apps'
      ],
      WRITING: [
        'Write simple paragraphs',
        'Practice sentence structure',
        'Basic grammar exercises'
      ]
    },
    Below: {
      READING: [
        'Focus on basics',
        'Use simplified materials',
        'Build core vocabulary'
      ],
      LISTENING: [
        'Use simplified audio',
        'Practice with subtitles',
        'Focus on basic listening'
      ],
      SPEAKING: [
        'Practice basic expressions',
        'Focus on pronunciation',
        'Use language apps'
      ],
      WRITING: [
        'Practice basic sentences',
        'Focus on grammar basics',
        'Build writing confidence'
      ]
    }
  };

  return levelSpecificActivities[level]?.[skill as keyof typeof levelSpecificActivities.C1] || [];
};

const getSkillSpecificResources = (skill: string, score: number): string[] => {
  const level = getLevelForScore(score);
  
  const levelResources = {
    C1: {
      suffix: 'advanced'
    },
    B2: {
      suffix: 'intermediate-advanced'
    },
    B1: {
      suffix: 'intermediate'
    },
    A2: {
      suffix: 'basic'
    },
    Below: {
      suffix: 'beginner'
    }
  };

  const suffix = levelResources[level]?.suffix;
  
  const resources = {
    READING: [
      `TOEFL Reading Practice Tests (${suffix})`,
      'Academic Word Lists',
      'Speed Reading Tools',
      `Reading Comprehension Materials (${suffix})`
    ],
    LISTENING: [
      `TOEFL Listening Practice Tests (${suffix})`,
      'Academic Lecture Videos',
      'Pronunciation Apps',
      `Listening Exercise Collection (${suffix})`
    ],
    SPEAKING: [
      'TOEFL Speaking Templates',
      'Pronunciation Software',
      'Language Exchange Apps',
      `Speaking Practice Materials (${suffix})`
    ],
    WRITING: [
      'TOEFL Writing Templates',
      'Grammar Checker Tools',
      `Writing Practice Materials (${suffix})`,
      'Vocabulary Building Apps'
    ]
  };

  return resources[skill as keyof typeof resources] || [];
};

export const generatePersonalizedRecommendations = (studentData: StudentData): PersonalizedRecommendations => {
  const recommendations: PersonalizedRecommendations = {};

  ['READING', 'LISTENING', 'SPEAKING', 'WRITING'].forEach(skill => {
    const score = studentData[skill as keyof StudentData] as number;
    
    let feedbackAnalysis: { strengths: string[], weaknesses: string[] } = { strengths: [], weaknesses: [] };
    if (skill === 'SPEAKING' || skill === 'WRITING') {
      const feedback = studentData[`FEEDBACK ${skill}` as keyof StudentData] as string;
      if (feedback) {
        feedbackAnalysis = analyzeFeedback(feedback);
      }
    }

    recommendations[skill] = {
      strength: feedbackAnalysis.strengths,
      improvement: feedbackAnalysis.weaknesses,
      activities: getSkillSpecificActivities(skill, score),
      resources: getSkillSpecificResources(skill, score)
    };
  });

  return recommendations;
};