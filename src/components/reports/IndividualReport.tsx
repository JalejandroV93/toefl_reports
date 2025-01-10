// components/reports/IndividualReport.tsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { StudentData } from "@/types";
/* import { generateIndividualReportPDF } from "@/utils/individualPdfGenerator"; */
import SkillScoreCard from "./SkillScoreCard";
import SkillsRadar from "./SkillsRadar";
import SkillAnalysis from "./SkillAnalysis";
import ActionPlan from "./ActionPlan";
import { useGeminiRecommendations } from "@/hooks/useGeminiRecommendations";
import Loader from "../ui/loader";
import {
  calculateTotalScore,
  getTotalLevel,
} from "@/utils/scoreConversion";
import { Badge } from "@/components/ui/badge";

interface IndividualReportProps {
  studentData: StudentData;
  recommendations?: Record<string, string[]>;
}

const SKILLS = ["READING", "LISTENING", "SPEAKING", "WRITING"] as const;

const IndividualReport: React.FC<IndividualReportProps> = ({ studentData }) => {
  const { recommendations, isLoading } = useGeminiRecommendations(studentData);

  /* const handleDownloadPDF = async () => {
    const doc = generateIndividualReportPDF(studentData, recommendations);
    doc.save(
      `${studentData.Nombre}_${studentData["Apellido(s)"]}_TOEFL_Report.pdf`
    );
  }; */

  const radarData = SKILLS.map((skill) => ({
    subject: skill,
    score: studentData[skill],
    fullMark: 30,
  }));

  const totalScore = calculateTotalScore(studentData);
  const totalLevel = getTotalLevel(totalScore);

  if (isLoading) {
    return <Loader />;
  }
  console.log("feedback ind", studentData["FEEDBACK WRITING"]);

  const getFeedbackKey = (skill: (typeof SKILLS)[number]) => {
    return `FEEDBACK ${skill}` as keyof StudentData;
  };

  const handlePrint = () => { window.print(); };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="text-2xl font-bold">
            {studentData.Nombre} {studentData["Apellido(s)"]}
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">TOEFL Assessment Report</p>
        </div>
        <Button
          onClick={handlePrint}
          variant="outline"
          className="ml-auto print:hidden"
        >
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Skills Overview */}
        <section className="bg-white rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Skills Overview
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Total Score:</span>
              <span className="font-bold text-xl text-blue-600">
                {totalScore}/120
              </span>
              <Badge variant="outline" className="ml-2">
                Level {totalLevel}
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-50/50 p-4 rounded-lg">
              <SkillsRadar data={radarData} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {SKILLS.map((skill) => (
                <SkillScoreCard
                  key={skill}
                  skill={skill}
                  score={studentData[skill]}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Detailed Analysis */}
        <section className="bg-white rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Detailed Analysis
          </h3>
          <div className="space-y-6">
            {SKILLS.map((skill) => (
              <SkillAnalysis
                key={skill}
                skill={skill}
                score={studentData[skill]}
                feedback={studentData[getFeedbackKey(skill)]?.toString()}
                recommendations={recommendations[skill]}
              />
            ))}
          </div>
        </section>

        {/* Action Plan */}
        <section className="bg-white rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Action Plan
          </h3>
          <ActionPlan studentData={studentData} />
        </section>
      </CardContent>
    </Card>
  );
};

export default IndividualReport;
