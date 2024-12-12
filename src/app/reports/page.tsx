'use client';

import GeneralReport from "@/components/analysis/GeneralReport";
import { useReports } from "@/providers/ReportProvider";

export default function ReportsPage() {
  const { studentsData } = useReports();

  return <GeneralReport studentsData={studentsData} />;
}
