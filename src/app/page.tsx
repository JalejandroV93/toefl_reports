'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CSVReader from "@/components/analysis/CSVReader";
import { useReports } from "@/providers/ReportProvider";

export default function Home() {
  const { handleDataLoaded } = useReports();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-4xl font-bold" style={{ color: '#be1522' }}>
            TOEFL Assessment Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 text-center">
            Upload your CSV file to generate TOEFL assessment reports.
          </p>
          <CSVReader onDataLoaded={handleDataLoaded} />
        </CardContent>
      </Card>
    </div>
  );
}

