// services/reportFactoryService.ts
import { StudentData, ChartData } from '@/types';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { calculateLevelDistribution } from '@/utils/reportUtils';
import { getLevelForScore } from '@/utils/skillAnalysisUtils';

interface GeneratedRecommendations {
  general: {
    shortTermActions: string[];
    longTermStrategy: string[];
  };
  individual: Record<string, {
    strengths: string[];
    weaknesses: string[];
    shortTermActions: string[];
    longTermStrategy: string[];
  }>;
}

interface GeneratedAnalysis {
  skillAnalysis: Record<string, {
    strengths: string[];
    improvements: string[];
  }>;
}

export class ReportFactoryService {
  private readonly API_KEY: string;

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key not found');
    }
    this.API_KEY = apiKey;
  }

  private async generateGeneralRecommendations(
    distributionData: ChartData[]
  ): Promise<GeneratedRecommendations['general']> {
    try {
      const genAI = new GoogleGenerativeAI(this.API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

      const prompt = `
        Analyze this TOEFL skills distribution data and generate recommendations:
        ${JSON.stringify(distributionData)}

        Generate a JSON response with exactly this structure:
        {
          "shortTermActions": [
            "4 specific immediate actions to improve the weakest areas",
            "should be concrete and actionable",
            "focus on quick wins and critical improvements",
            "consider the current distribution of levels"
          ],
          "longTermStrategy": [
            "4 strategic long-term recommendations",
            "should focus on sustainable improvement",
            "consider program-level changes and systematic approaches",
            "aim for overall skill integration and advancement"
          ]
        }
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return JSON.parse(text.replace(/```json\n|\n```/g, "").trim());
    } catch (error) {
      console.error('Error generating general recommendations:', error);
      return {
        shortTermActions: [
          "Implement intensive practice sessions",
          "Develop structured assessment program",
          "Create skill-specific study groups",
          "Provide targeted resources"
        ],
        longTermStrategy: [
          "Establish progress monitoring system",
          "Develop curriculum alignment",
          "Create learning pathways",
          "Implement integrated skills approach"
        ]
      };
    }
  }

  private async generateIndividualRecommendations(
    studentData: StudentData
  ): Promise<GeneratedRecommendations['individual']> {
    try {
      const genAI = new GoogleGenerativeAI(this.API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
      
      const skillsData = {
        READING: {
          score: studentData.READING,
          level: getLevelForScore(studentData.READING)
        },
        LISTENING: {
          score: studentData.LISTENING,
          level: getLevelForScore(studentData.LISTENING)
        },
        SPEAKING: {
          score: studentData.SPEAKING,
          level: getLevelForScore(studentData.SPEAKING),
          feedback: studentData['FEEDBACK SPEAKING']
        },
        WRITING: {
          score: studentData.WRITING,
          level: getLevelForScore(studentData.WRITING),
          feedback: studentData['FEEDBACK WRITING']
        }
      };

      const prompt = `
        Analyze this TOEFL student's performance and generate recommendations.
        Student Data: ${JSON.stringify(skillsData, null, 2)}

        For each skill (READING, LISTENING, SPEAKING, WRITING), provide recommendations
        in this exact format:
        {
          "READING": {
            "strengths": ["strength1", "strength2"],
            "weaknesses": ["weakness1", "weakness2"],
            "shortTermActions": ["action1", "action2", "action3"],
            "longTermStrategy": ["strategy1", "strategy2", "strategy3"]
          },
          "LISTENING": {same structure},
          "SPEAKING": {same structure},
          "WRITING": {same structure}
        }
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return JSON.parse(text.replace(/```json\n|\n```/g, "").trim());
    } catch (error) {
      console.error('Error generating individual recommendations:', error);
      return this.getDefaultIndividualRecommendations();
    }
  }

  private async generateSkillAnalysis(
    distributionData: ChartData[]
  ): Promise<GeneratedAnalysis> {
    try {
      const genAI = new GoogleGenerativeAI(this.API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      const prompt = `
        Analyze this TOEFL skills distribution data and provide specific insights:
        ${JSON.stringify(distributionData)}

        Generate a JSON response with this structure:
        {
          "skillAnalysis": {
            "Reading": {
              "strengths": ["3-4 specific strengths"],
              "improvements": ["3-4 specific areas for improvement"]
            },
            "Listening": {same structure},
            "Speaking": {same structure},
            "Writing": {same structure}
          }
        }
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return JSON.parse(text.replace(/```json\n|\n```/g, "").trim());
    } catch (error) {
      console.error('Error generating skill analysis:', error);
      return this.getDefaultSkillAnalysis();
    }
  }

  private getDefaultIndividualRecommendations(): GeneratedRecommendations['individual'] {
    const defaultSkill = {
      strengths: ['Basic understanding established'],
      weaknesses: ['Needs consistent practice'],
      shortTermActions: [
        'Practice with TOEFL materials daily',
        'Work on core skills',
        'Use study resources regularly'
      ],
      longTermStrategy: [
        'Develop study routine',
        'Track progress regularly',
        'Seek feedback on improvements'
      ]
    };

    return {
      READING: { ...defaultSkill },
      LISTENING: { ...defaultSkill },
      SPEAKING: { ...defaultSkill },
      WRITING: { ...defaultSkill }
    };
  }

  private getDefaultSkillAnalysis(): GeneratedAnalysis {
    const defaultAnalysis = {
      strengths: [
        'Students show consistent participation',
        'Basic understanding established',
        'Foundation for improvement present'
      ],
      improvements: [
        'Need for more structured practice',
        'Focus on advanced skill development',
        'Strengthen core competencies'
      ]
    };

    return {
      skillAnalysis: {
        Reading: { ...defaultAnalysis },
        Listening: { ...defaultAnalysis },
        Speaking: { ...defaultAnalysis },
        Writing: { ...defaultAnalysis }
      }
    };
  }

  async generateReportData(studentsData: StudentData[]) {
    const distributionData = calculateLevelDistribution(studentsData);
    
    // Generate all recommendations and analysis in parallel
    const [generalRecommendations, skillAnalysis, individualRecommendations] = await Promise.all([
      this.generateGeneralRecommendations(distributionData),
      this.generateSkillAnalysis(distributionData),
      Promise.all(studentsData.map(student => this.generateIndividualRecommendations(student)))
    ]);

    return {
      distribution: distributionData,
      recommendations: {
        general: generalRecommendations,
        individual: individualRecommendations
      },
      analysis: skillAnalysis
    };
  }
}

export const reportFactoryService = new ReportFactoryService();