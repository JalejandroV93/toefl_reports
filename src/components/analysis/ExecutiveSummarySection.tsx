import React from 'react';
import { ChartData } from '@/types';
import { getLevelForScore } from '@/utils/reportUtils';

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
  lowestPerformanceSkill,
}) => {
  const overallData = distributionData.find(item => item.skill === "Overall");
  
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Executive Summary</h2>
      <div className="bg-gray-50 p-6 rounded-lg">
        <p className="text-gray-700 mb-4">
          Analysis based on the evaluation of {studentsCount} students across the four main TOEFL skills. 
          The overall average is at {getLevelForScore(overallData?.average || 0)} level 
          ({overallData?.average || 0} points), with significant variations across skills.
        </p>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Highest Performance</h3>
            <p>{highestPerformanceSkill} ({distributionData.find(item => item.skill === highestPerformanceSkill)?.average} average)</p>
            <ul className="list-disc ml-4 mt-2 text-sm">
              <li>
                {distributionData.find(item => item.skill === highestPerformanceSkill)?.B1} students at B1 level
              </li>
              <li>Strong oral communication skills</li>
            </ul>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Areas for Improvement</h3>
            <p>{lowestPerformanceSkill} ({distributionData.find(item => item.skill === lowestPerformanceSkill)?.average} average)</p>
            <ul className="list-disc ml-4 mt-2 text-sm">
              <li>
                {distributionData.find(item => item.skill === lowestPerformanceSkill)?.Below} students below A2 level
              </li>
              <li>Requires immediate attention</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExecutiveSummarySection;