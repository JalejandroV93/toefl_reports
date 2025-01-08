// services/reportFactoryService.ts
import { StudentData, ChartData } from '@/types';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { calculateLevelDistribution } from '@/utils/reportUtils';
import { getLevelForScore } from '@/utils/skillAnalysisUtils';
import { Subject } from 'rxjs';
import { GeminiRateLimiter, geminiRateLimiter } from './geminiRateLimiter';

export interface GenerationProgress {
  stage: 'general' | 'individual' | 'analysis';
  current: number;
  total: number;
  estimatedWaitTime: number;
}

export class ReportFactoryService {
  private readonly API_KEY: string;
  private progressSubject = new Subject<GenerationProgress>();
  private rateLimiter: GeminiRateLimiter;

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key not found');
    }
    this.API_KEY = apiKey;
    this.rateLimiter = geminiRateLimiter;
  }

  get progressObservable() {
    return this.progressSubject.asObservable();
  }

  private async generateWithRateLimiter<T>(
    stage: GenerationProgress['stage'],
    current: number,
    total: number,
    generator: () => Promise<T>
  ): Promise<T> {
    const waitTime = this.rateLimiter.getEstimatedWaitTime();
    this.progressSubject.next({
      stage,
      current,
      total,
      estimatedWaitTime: waitTime
    });

    return await this.rateLimiter.enqueue(generator);
  }

  private async generateGeneralRecommendations(distributionData: ChartData[]) {
    return this.generateWithRateLimiter(
      'general',
      1,
      1,
      async () => {
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

        try {
          const result = await model.generateContent(prompt);
          const text = result.response.text();
          return JSON.parse(text.replace(/```json\n|\n```/g, "").trim());
        } catch (error) {
          console.error('Error generating general recommendations:', error);
          return this.getDefaultGeneralRecommendations();
        }
      }
    );
  }

  private async generateIndividualRecommendations(
    studentData: StudentData,
    index: number,
    total: number
  ) {
    return this.generateWithRateLimiter(
      'individual',
      index + 1,
      total,
      async () => {
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

          For each skill provide recommendations in JSON format:
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

        try {
          const result = await model.generateContent(prompt);
          const text = result.response.text();
          return JSON.parse(text.replace(/```json\n|\n```/g, "").trim());
        } catch (error) {
          console.error('Error generating individual recommendations:', error);
          return this.getDefaultIndividualRecommendations();
        }
      }
    );
  }

  private async generateSkillAnalysis(distributionData: ChartData[]) {
    return this.generateWithRateLimiter(
      'analysis',
      1,
      1,
      async () => {
        const genAI = new GoogleGenerativeAI(this.API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const prompt = `
          Analyze this TOEFL skills distribution data:
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

        try {
          const result = await model.generateContent(prompt);
          const text = result.response.text();
          return JSON.parse(text.replace(/```json\n|\n```/g, "").trim());
        } catch (error) {
          console.error('Error generating skill analysis:', error);
          return this.getDefaultSkillAnalysis();
        }
      }
    );
  }

  private getDefaultGeneralRecommendations() {
    return {
      shortTermActions: [
        "Implement intensive practice sessions for core skills",
        "Develop structured assessment program",
        "Create focused study groups for each skill level",
        "Provide targeted resources for identified weak areas"
      ],
      longTermStrategy: [
        "Establish comprehensive progress monitoring system",
        "Develop curriculum alignment with TOEFL requirements",
        "Create personalized learning pathways",
        "Implement integrated skills approach across all levels"
      ]
    };
  }

  private getDefaultIndividualRecommendations() {
    const defaultSkill = {
      strengths: ['Basic understanding established'],
      weaknesses: ['Needs consistent practice'],
      shortTermActions: [
        'Practice with TOEFL materials daily',
        'Work on core skills',
        'Use study resources regularly'
      ],
      longTermStrategy: [
        'Develop consistent study routine',
        'Track progress systematically',
        'Seek regular feedback on improvements'
      ]
    };

    return {
      READING: { ...defaultSkill },
      LISTENING: { ...defaultSkill },
      SPEAKING: { ...defaultSkill },
      WRITING: { ...defaultSkill }
    };
  }

  private getDefaultSkillAnalysis() {
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
    
    // Generate general recommendations and skill analysis in parallel
    const [generalRecommendations, skillAnalysis] = await Promise.all([
      this.generateGeneralRecommendations(distributionData),
      this.generateSkillAnalysis(distributionData)
    ]);

    // Generate individual recommendations sequentially
    const individualRecommendations = [];
    for (let i = 0; i < studentsData.length; i++) {
      const recommendations = await this.generateIndividualRecommendations(
        studentsData[i],
        i,
        studentsData.length
      );
      individualRecommendations.push(recommendations);
    }

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