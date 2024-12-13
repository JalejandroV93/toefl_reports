// app/shared/[type]/[token]/page.tsx
import { notFound } from 'next/navigation';
import { reportService } from '@/services/reportService';
import { Card, CardContent } from "@/components/ui/card";
import GeneralReport from '@/components/analysis/GeneralReport';
import IndividualReport from '@/components/reports/IndividualReport';
import { StudentData } from '@/types';

interface SharedReportPageProps {
  params: { 
    type: 'report' | 'student';
    token: string;
  }
}

export default async function SharedReportPage({ params }: SharedReportPageProps) {
  try {
    if (params.type === 'report') {
      const report = await reportService.getReportByToken(params.token);
      
      if (!report) {
        notFound();
      }

      // Convert stored data to StudentData format
      const studentsData: StudentData[] = report.students.map(student => ({
        Nombre: student.name,
        'Apellido(s)': student.lastName,
        READING: student.reading,
        LISTENING: student.listening,
        SPEAKING: student.speaking,
        WRITING: student.writing,
        'FEEDBACK SPEAKING': student.speakingFeedback || '',
        'FEEDBACK WRITING': student.writingFeedback || ''
      }));

      return (
        <div className="container mx-auto py-8">
          <Card>
            <CardContent className="p-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">TOEFL Assessment Report</h1>
                <p className="text-gray-600">Group: {report.group}</p>
                <p className="text-gray-600">
                  Generated: {new Date(report.createdAt).toLocaleDateString()}
                </p>
              </div>
              <GeneralReport 
                studentsData={studentsData}
                savedRecommendations={JSON.parse(report.recommendations)}
                savedDistribution={JSON.parse(report.distribution)}
                savedAnalysis={JSON.parse(report.analysis)}
              />
            </CardContent>
          </Card>
        </div>
      );
    }

    if (params.type === 'student') {
      const studentReport = await reportService.getStudentReportByToken(params.token);
      
      if (!studentReport) {
        notFound();
      }

      const studentData: StudentData = {
        Nombre: studentReport.name,
        'Apellido(s)': studentReport.lastName,
        READING: studentReport.reading,
        LISTENING: studentReport.listening,
        SPEAKING: studentReport.speaking,
        WRITING: studentReport.writing,
        'FEEDBACK SPEAKING': studentReport.speakingFeedback || '',
        'FEEDBACK WRITING': studentReport.writingFeedback || ''
      };

      return (
        <div className="container mx-auto py-8">
          <Card>
            <CardContent className="p-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">Individual TOEFL Assessment</h1>
                <p className="text-gray-600">
                  Group: {studentReport.report.group}
                </p>
                <p className="text-gray-600">
                  Generated: {new Date(studentReport.report.createdAt).toLocaleDateString()}
                </p>
              </div>
              <IndividualReport 
                studentData={studentData}
              />
            </CardContent>
          </Card>
        </div>
      );
    }

    throw new Error('Invalid report type');
  } catch (error) {
    console.error('Error in SharedReportPage:', error);
    notFound();
  }
}