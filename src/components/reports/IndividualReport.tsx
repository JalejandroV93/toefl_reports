// components/reports/IndividualReport.tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { StudentData } from "@/types";
import { generateIndividualReportPDF } from "@/utils/individualPdfGenerator";
import SkillScoreCard from "./SkillScoreCard";
import SkillsRadar from "./SkillsRadar";
import SkillAnalysis from "./SkillAnalysis";
import ActionPlan from "./ActionPlan";
import { useGeminiRecommendations } from "@/hooks/useGeminiRecommendations";
//import { Skeleton } from "@/components/ui/skeleton";
import Loader from "../ui/loader";
interface IndividualReportProps {
  studentData: StudentData;
}

const IndividualReport: React.FC<IndividualReportProps> = ({ studentData }) => {
  const { recommendations, isLoading } = useGeminiRecommendations(studentData);

  const handleDownloadPDF = async () => {
    const doc = generateIndividualReportPDF(studentData, recommendations);
    doc.save(
      `${studentData.Nombre}_${studentData["Apellido(s)"]}_TOEFL_Report.pdf`
    );
  };

  const skills = ["READING", "LISTENING", "SPEAKING", "WRITING"] as const;

  const radarData = skills.map((skill) => ({
    subject: skill,
    score: studentData[skill],
    fullMark: 100,
  }));

  if (isLoading) {
    return <Loader />;
  }

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
          onClick={handleDownloadPDF}
          variant="outline"
          className="ml-auto"
        >
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Skills Overview */}
        <section>
          <h3 className="text-lg font-semibold mb-4">Skills Overview</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <SkillsRadar data={radarData} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {skills.map((skill) => (
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
        <section>
          <h3 className="text-lg font-semibold mb-4">Detailed Analysis</h3>
          <div className="space-y-6">
            {["SPEAKING", "WRITING"].map((skill) => (
              <SkillAnalysis
                key={skill}
                skill={skill}
                score={studentData[skill as keyof StudentData] as number}
                feedback={
                  studentData[
                    `FEEDBACK ${skill}` as keyof StudentData
                  ] as string
                }
                recommendations={recommendations[skill]}
              />
            ))}
          </div>
        </section>

        {/* Action Plan */}
        <section>
          <h3 className="text-lg font-semibold mb-4">Action Plan</h3>
          <ActionPlan studentData={studentData} />
        </section>
      </CardContent>
    </Card>
  );
};

export default IndividualReport;
