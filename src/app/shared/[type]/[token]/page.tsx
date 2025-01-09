import { notFound } from "next/navigation";
import { serverReportService } from "@/services/server/reportService";
import { Card, CardContent } from "@/components/ui/card";
import GeneralReport from "@/components/analysis/GeneralReport";
import IndividualReport from "@/components/reports/IndividualReport";
import { StudentData } from "@/types";
import { Logo } from "@/components/ui/logo";

type tParams = Promise<{
    type: "report" | "student";
    token: string;
}>;

async function SharedReportPage({ params }: { params: tParams }) {
  try {
    const { type, token } = await params;
    //console.log("Getting shared report by token:", token);
    if (type === "report") {
      //console.log("Getting report by token:", token);
      const report = await serverReportService.getReportByToken(token);

      if (!report) {
        return <div>Report not found</div>;
      }

      // Convert stored data to StudentData format
      const studentsData: StudentData[] = report.students.map((student) => ({
        Nombre: student.name,
        "Apellido(s)": student.lastName,
        READING: student.reading,
        LISTENING: student.listening,
        SPEAKING: student.speaking,
        WRITING: student.writing,
        "FEEDBACK SPEAKING": student.speakingFeedback || "",
        "FEEDBACK WRITING": student.writingFeedback || "",
      }));

      // Add null checks and provide default values
      const recommendations = report.recommendations
        ? JSON.parse(report.recommendations.toString())
        : {
            READING: [],
            LISTENING: [],
            SPEAKING: [],
            WRITING: [],
          };

      const distribution = report.distribution
        ? JSON.parse(report.distribution.toString())
        : {};

      const analysis = report.analysis
        ? JSON.parse(report.analysis.toString())
        : null;

      return (
        <div className="container mx-auto py-8">
          <Card>
            <CardContent className="p-6">
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold mb-2">
                    TOEFL Assessment Report
                  </h1>
                  <p className="text-gray-600">Group: {report.group}</p>
                  <p className="text-gray-600">
                    Generated:{" "}
                    {new Date(report.createdAt).toLocaleDateString("es-CO")}
                  </p>
                </div>
                <Logo />
              </div>
              <GeneralReport
                studentsData={studentsData}
                recommendations={recommendations}
                distribution={distribution}
                analysis={analysis}
              />
            </CardContent>
          </Card>
        </div>
      );
    }

    if (type === "student") {
      const studentReport = await serverReportService.getStudentReportByToken(
        token
      );

      if (!studentReport) {
        notFound();
      }

      const studentData: StudentData = {
        Nombre: studentReport.name,
        "Apellido(s)": studentReport.lastName,
        READING: studentReport.reading,
        LISTENING: studentReport.listening,
        SPEAKING: studentReport.speaking,
        WRITING: studentReport.writing,
        "FEEDBACK SPEAKING": studentReport.speakingFeedback || "",
        "FEEDBACK WRITING": studentReport.writingFeedback || "",
      };

      const recommendations = studentReport.recommendations
        ? JSON.parse(studentReport.recommendations.toString())
        : {
            READING: [],
            LISTENING: [],
            SPEAKING: [],
            WRITING: [],
          };

      return (
        <div className="container mx-auto py-8">
          <Card>
            <CardContent className="p-6">
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold mb-2">
                    Individual TOEFL Assessment
                  </h1>
                  <p className="text-gray-600">
                    Group: {studentReport.report.group}
                  </p>
                  <p className="text-gray-600">
                    Generated:{" "}
                    {new Date(
                      studentReport.report.createdAt
                    ).toLocaleDateString("es-CO")}
                  </p>
                </div>
                <Logo />
              </div>
              <IndividualReport
                studentData={studentData}
                recommendations={recommendations}
              />
            </CardContent>
          </Card>
        </div>
      );
    }

    throw new Error("Invalid report type");
  } catch (error) {
    console.error("Error in SharedReportPage:", error);
    notFound();
  }
}
export default SharedReportPage;
