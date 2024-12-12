// 'use client';
// import { use } from 'react';
// import IndividualReport from "@/components/reports/IndividualReport";
// import { useReports } from "@/providers/ReportProvider";
// import { notFound } from "next/navigation";

// export default function StudentReportPage({ 
//   params 
// }: { 
//   params: { studentId: string } 
// }) {
//   const { studentsData } = useReports();
//   const studentIndex = parseInt(params.studentId);
//   const studentData = studentsData[studentIndex];

//   if (!studentData) {
//     notFound();
//   }

//   return <IndividualReport studentData={studentData} />;
// }

'use client';

import { use } from 'react';
import IndividualReport from "@/components/reports/IndividualReport";
import { useReports } from "@/providers/ReportProvider";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ studentId: string }>;
}

export default function StudentReportPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { studentsData } = useReports();
  const studentIndex = parseInt(resolvedParams.studentId);
  const studentData = studentsData[studentIndex];

  if (!studentData) {
    notFound();
  }

  return <IndividualReport studentData={studentData} />;
}