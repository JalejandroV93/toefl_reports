import React from 'react';
import { ChartData } from '@/types';

interface DetailedAnalysisSectionProps {
  distributionData: ChartData[];
}

const DetailedAnalysisSection: React.FC<DetailedAnalysisSectionProps> = ({ 
  distributionData 
}) => {
  // Filter out the "Overall" entry and only process individual skills
  const skillsData = distributionData.filter(data => data.skill !== 'Overall');

  const getSkillAnalysis = (skill: string): { strengths: string[], improvements: string[] } => {
    const analysis = {
      Reading: {
        strengths: [
          'Strong comprehension of academic texts',
          'Good analysis of complex materials',
        ],
        improvements: [
          'Focus on reading speed and efficiency',
          'Practice with technical vocabulary',
        ],
      },
      Listening: {
        strengths: [
          'Good understanding of lectures',
          'Ability to follow complex discussions',
        ],
        improvements: [
          'Work on note-taking strategies',
          'Practice with different accents',
        ],
      },
      Speaking: {
        strengths: [
          'Clear pronunciation and delivery',
          'Good response organization',
        ],
        improvements: [
          'Improve speaking fluency',
          'Practice with academic vocabulary',
        ],
      },
      Writing: {
        strengths: [
          'Good essay structure',
          'Clear argument development',
        ],
        improvements: [
          'Enhance vocabulary usage',
          'Work on grammar accuracy',
        ],
      },
    };

    return analysis[skill as keyof typeof analysis] || {
      strengths: [],
      improvements: [],
    };
  };

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Detailed Analysis</h2>
      <div className="space-y-4">
        {skillsData.map((skill) => {
          const analysis = getSkillAnalysis(skill.skill);
          const averageScore = skill.average || 0;

          return (
            <div key={skill.skill} className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-lg mb-2">{skill.skill}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="mb-2">Average Score: {averageScore.toFixed(1)}</p>
                  <p>Distribution:</p>
                  <ul className="list-disc ml-4 mt-1">
                    <li>C1: {skill.C1} students</li>
                    <li>B2: {skill.B2} students</li>
                    <li>B1: {skill.B1} students</li>
                    <li>A2: {skill.A2} students</li>
                    <li>Below A2: {skill.Below} students</li>
                  </ul>
                </div>
                <div>
                  <div className="mb-4">
                    <p className="font-medium text-green-700">Strengths:</p>
                    <ul className="list-disc ml-4">
                      {analysis.strengths.map((strength, index) => (
                        <li key={index}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-red-700">Areas for Improvement:</p>
                    <ul className="list-disc ml-4">
                      {analysis.improvements.map((improvement, index) => (
                        <li key={index}>{improvement}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default DetailedAnalysisSection;