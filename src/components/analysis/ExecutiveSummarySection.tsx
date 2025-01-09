import { ExecutiveSummaryProps } from "@/types";
import { getTotalLevel } from "@/utils/scoreConversion";
import {
  calculateOverallAverage,
  analyzeSkillPerformance,
} from "@/utils/reportUtils";
import { Presentation } from "lucide-react";
import React from "react";

const ExecutiveSummarySection: React.FC<ExecutiveSummaryProps> = ({
  studentsCount,
  distributionData,
}) => {
  const calculatedOverallAverage = calculateOverallAverage(
    distributionData,
    studentsCount
  );

  // Analizar el rendimiento de cada skill
  const skillsAnalysis = distributionData
    .filter((item) => item.skill !== "Overall")
    .map((skill) => analyzeSkillPerformance(skill, studentsCount));

  // Ordenar por rendimiento para encontrar la mejor y peor skill
  const sortedByPerformance = [...skillsAnalysis].sort(
    (a, b) => b.performanceScore - a.performanceScore
  );
  const bestPerformingSkill = sortedByPerformance[0];
  const worstPerformingSkill =
    sortedByPerformance[sortedByPerformance.length - 1];

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Presentation className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-semibold">Executive Summary</h2>
      </div>
      <div className="bg-gray-50 p-6 rounded-lg">
        <p className="text-gray-700 mb-4">
          Analysis based on the evaluation of {studentsCount} students across
          the four main TOEFL skills. The overall average is at{" "}
          {getTotalLevel(calculatedOverallAverage)} level (
          {calculatedOverallAverage.toFixed(1)} points).
        </p>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <PerformanceCard
            type="best"
            skillData={bestPerformingSkill}
            studentsCount={studentsCount}
          />
          <PerformanceCard
            type="worst"
            skillData={worstPerformingSkill}
            studentsCount={studentsCount}
          />
        </div>
      </div>
    </section>
  );
};

interface PerformanceCardProps {
  type: "best" | "worst";
  skillData: ReturnType<typeof analyzeSkillPerformance>;
  studentsCount: number;
}

const PerformanceCard: React.FC<PerformanceCardProps> = ({
  type,
  skillData,
  studentsCount,
}) => {
  const isBest = type === "best";

  return (
    <div className={`${isBest ? "bg-blue-50" : "bg-red-50"} p-4 rounded-lg`}>
      <h3 className="font-medium mb-2">
        {isBest ? "Highest Performance" : "Areas for Improvement"}
      </h3>
      <p>
        {skillData.skill} ({skillData.average.toFixed(1)} average)
      </p>
      <ul className="list-disc ml-4 mt-2 text-sm">
        <li>
          {isBest
            ? `${skillData.highLevelCount} students at B2 or higher`
            : `${skillData.lowLevelCount} students at B1 or lower`}
        </li>
        <li>
          {isBest
            ? `${((skillData.highLevelCount / studentsCount) * 100).toFixed(
                1
              )}% advanced performance`
            : `${skillData.needsImprovement.toFixed(1)}% need improvement`}
        </li>
      </ul>
    </div>
  );
};

export default ExecutiveSummarySection;
