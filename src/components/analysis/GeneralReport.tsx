"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { StudentData, ChartData } from "@/types";
import { calculateLevelDistribution } from "@/utils/reportUtils";
import { generateGeneralReportPDF } from "@/utils/pdfGenerator";
import ExecutiveSummarySection from "./ExecutiveSummarySection";
import SkillsDistributionSection from "./SkillsDistributionSection";
import DetailedAnalysisSection from "./DetailedAnalysisSection";
import RecommendationsSection from "./RecommendationsSection";
import { useGeminiGeneralRecommendations } from "@/hooks/useGeminiGeneralRecommendations";
import { useGeminiSkillAnalysis } from "@/hooks/useGeminiSkillAnalysis";
import { GeminiResponse } from "@/hooks/useGeminiGeneralRecommendations";
import { SkillsAnalysis } from "@/hooks/useGeminiSkillAnalysis";

interface GeneralReportProps {
  studentsData: StudentData[];
  recommendations?: GeminiResponse;
  distribution?: string; //  string, as it comes from the DB
  analysis?: SkillsAnalysis;
}

const GeneralReport: React.FC<GeneralReportProps> = ({
  studentsData,
  recommendations: initialRecommendations,
  distribution: initialDistribution,
  analysis: initialAnalysis,
}) => {
  const distributionData = useMemo<ChartData[]>(() => {
    if (initialDistribution) {
      try {
        return JSON.parse(initialDistribution);
      } catch (error) {
        console.error("Error parsing initialDistribution:", error);
        return calculateLevelDistribution(studentsData);
      }
    }
    return calculateLevelDistribution(studentsData);
  }, [initialDistribution, studentsData]);

  const { recommendations, isLoading: recommendationsLoading } =
    useGeminiGeneralRecommendations(distributionData, initialRecommendations);

  const { analysis, isLoading: analysisLoading } = useGeminiSkillAnalysis(
    distributionData,
    initialAnalysis
  );

  const skillsData = distributionData.filter(
    (item) => item.skill !== "Overall"
  );

  const highestPerformanceSkill = skillsData.reduce<ChartData>(
    (
      prev: ChartData,
      current: ChartData // Explicit types here
    ) => ((current.average || 0) > (prev.average || 0) ? current : prev),
    skillsData[0] // Initial value with correct type
  ).skill;

  const lowestPerformanceSkill = skillsData.reduce<ChartData>(
    (
      prev: ChartData,
      current: ChartData // Explicit types here
    ) => ((current.average || 0) < (prev.average || 0) ? current : prev),
    skillsData[0] // Initial value
  ).skill;

  const handleDownloadPDF = () => {
    const doc = generateGeneralReportPDF(studentsData, recommendations);
    doc.save("general_report.pdf");
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="text-3xl font-bold">General Report</CardTitle>
        <Button
          onClick={handleDownloadPDF}
          variant="outline"
          disabled={recommendationsLoading || analysisLoading}
        >
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </CardHeader>

      <CardContent className="space-y-8">
        <ExecutiveSummarySection
          studentsCount={studentsData.length}
          distributionData={distributionData}
          highestPerformanceSkill={highestPerformanceSkill}
          lowestPerformanceSkill={lowestPerformanceSkill}
        />

        <SkillsDistributionSection distributionData={distributionData} />

        <DetailedAnalysisSection
          distributionData={distributionData}
          analysis={analysis}
        />

        <RecommendationsSection distributionData={distributionData} />
      </CardContent>
    </Card>
  );
};

export default GeneralReport;
