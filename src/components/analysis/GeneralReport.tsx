// components/reports/GeneralReport.tsx
'use client';

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { StudentData } from "@/types";
import { calculateLevelDistribution } from "@/utils/reportUtils";
import { generateGeneralReportPDF } from "@/utils/pdfGenerator";
import ExecutiveSummarySection from './ExecutiveSummarySection';
import SkillsDistributionSection from './SkillsDistributionSection';
import DetailedAnalysisSection from './DetailedAnalysisSection';
import RecommendationsSection from './RecommendationsSection';
import { useGeminiGeneralRecommendations } from '@/hooks/useGeminiGeneralRecommendations';

interface GeneralReportProps {
  studentsData: StudentData[];
}

const GeneralReport: React.FC<GeneralReportProps> = ({ studentsData }) => {
  const distributionData = calculateLevelDistribution(studentsData);
  const { recommendations, isLoading } = useGeminiGeneralRecommendations(distributionData);

  const skillsData = distributionData.filter(item => item.skill !== 'Overall');
  const highestPerformanceSkill = skillsData.reduce((prev, current) => 
    (current.average || 0) > (prev.average || 0) ? current : prev
  ).skill;
  
  const lowestPerformanceSkill = skillsData.reduce((prev, current) => 
    (current.average || 0) < (prev.average || 0) ? current : prev
  ).skill;
  const handleDownloadPDF = () => {
    const doc = generateGeneralReportPDF(studentsData, recommendations);
    doc.save("general_report.pdf");
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="text-3xl font-bold">
          TOEFL Assessment General Report
        </CardTitle>
        <Button 
          onClick={handleDownloadPDF} 
          variant="outline"
          disabled={isLoading}
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
        
        <SkillsDistributionSection 
          distributionData={distributionData}
        />
        
        <DetailedAnalysisSection 
          distributionData={distributionData}
        />
        
        <RecommendationsSection
          distributionData={distributionData}
        />
      </CardContent>
    </Card>
  );
};

export default GeneralReport;