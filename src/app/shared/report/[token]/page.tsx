// app/shared/report/[token]/page.tsx
import { notFound } from 'next/navigation';
import { reportService } from '@/services/reportService';
import { Card, CardContent } from "@/components/ui/card";
import { Report, Student } from '@/types/report';
import { StudentData } from '@/types';
import GeneralReport from '@/components/analysis/GeneralReport';
// const GeneralReport = dynamic(
//   () => import('@/components/analysis/GeneralReport'),
//   { ssr: false }
// );

interface SharedReportPageProps {
  params: { token: string }
}

export default async function SharedReportPage({ params }: SharedReportPageProps) {
  const report = await reportService.getReportByToken(params.token) as Report | null;

  if (!report) {
    notFound();
  }

  // Convertir los datos almacenados al formato StudentData
  const studentsData: StudentData[] = report.students.map((student: Student) => ({
    Nombre: student.name,
    'Apellido(s)': student.lastName,
    READING: student.reading,
    LISTENING: student.listening,
    SPEAKING: student.speaking,
    WRITING: student.writing,
    'FEEDBACK SPEAKING': student.speakingFeedback || '',
    'FEEDBACK WRITING': student.writingFeedback || '',
  }));

  const recommendations = JSON.parse(report.recommendations);
  const distribution = JSON.parse(report.distribution);

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
            savedRecommendations={recommendations}
            savedDistribution={distribution}
          />
        </CardContent>
      </Card>
    </div>
  );
}