// app/shared/report/[token]/page.tsx

import { notFound } from 'next/navigation';
import { reportService } from '@/services/reportService';
import { Card, CardContent } from "@/components/ui/card";
import GeneralReport from '@/components/analysis/GeneralReport'

interface SharedReportPageProps {
  params: { token: string }
}

export default async function SharedReportPage({ params }: SharedReportPageProps) {
  const report = await reportService.getReportByToken(params.token);

  if (!report) {
    notFound();
  }

  // Convert stored data back to StudentData format
  const studentsData = report.students.map(student => ({
    Nombre: student.name,
    'Apellido(s)': student.lastName,
    READING: student.reading,
    LISTENING: student.listening,
    SPEAKING: student.speaking,
    WRITING: student.writing,
    'FEEDBACK SPEAKING': student.speakingFeedback || '',
    'FEEDBACK WRITING': student.writingFeedback || '',
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
            savedRecommendations={report.recommendations}
            savedDistribution={report.distribution}
          />
        </CardContent>
      </Card>
    </div>
  );
}