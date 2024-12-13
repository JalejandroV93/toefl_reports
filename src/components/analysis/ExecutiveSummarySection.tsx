import { ChartData } from '@/types';
import { getLevelForScore } from '@/utils/reportUtils';
import { Presentation } from 'lucide-react';
import React from 'react';

interface ExecutiveSummaryProps {
  studentsCount: number;
  distributionData: ChartData[];
  highestPerformanceSkill: string;
  lowestPerformanceSkill: string;
}

const ExecutiveSummarySection: React.FC<ExecutiveSummaryProps> = ({
  studentsCount,
  distributionData,
  highestPerformanceSkill,
}) => {
  const overallData = distributionData.find(item => item.skill === "Overall");
  
  // Encontrar la habilidad que necesita más mejoras basado en múltiples factores
  const skillsAnalysis = distributionData
    .filter(item => item.skill !== "Overall")
    .map(skill => ({
      skill: skill.skill,
      average: skill.average || 0,
      belowA2Count: skill.Below,
      a2Count: skill.A2,
      needsImprovement: (skill.Below + skill.A2) / studentsCount * 100, // Porcentaje de estudiantes en niveles bajos
    }))
    .sort((a, b) => b.needsImprovement - a.needsImprovement);

  const mostChallengedSkill = skillsAnalysis[0];

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Presentation className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-semibold">Executive Summary</h2>
      </div>
      <div className="bg-gray-50 p-6 rounded-lg">
        <p className="text-gray-700 mb-4">
          Analysis based on the evaluation of {studentsCount} students across the four main TOEFL skills. 
          The overall average is at {getLevelForScore(overallData?.average || 0)} level 
          ({(overallData?.average || 0).toFixed(1)} points), with significant variations across skills.
        </p>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Highest Performance</h3>
            <p>{highestPerformanceSkill} ({distributionData.find(item => 
              item.skill === highestPerformanceSkill)?.average?.toFixed(1)} average)</p>
            <ul className="list-disc ml-4 mt-2 text-sm">
              <li>
                {distributionData.find(item => 
                  item.skill === highestPerformanceSkill)?.C1} students at C1 level
              </li>
              <li>
                {distributionData.find(item => 
                  item.skill === highestPerformanceSkill)?.B2} students at B2 level
              </li>
            </ul>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Areas for Improvement</h3>
            <p>{mostChallengedSkill.skill} ({mostChallengedSkill.average.toFixed(1)} average)</p>
            <ul className="list-disc ml-4 mt-2 text-sm">
              {mostChallengedSkill.belowA2Count > 0 && (
                <li>
                  {mostChallengedSkill.belowA2Count} students below A2 level
                </li>
              )}
              {mostChallengedSkill.a2Count > 0 && (
                <li>
                  {mostChallengedSkill.a2Count} students at A2 level
                </li>
              )}
              <li>
                {mostChallengedSkill.needsImprovement.toFixed(1)}% of students at basic levels
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExecutiveSummarySection;