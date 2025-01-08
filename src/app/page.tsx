'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CSVReader from "@/components/analysis/CSVReader";
import { useReports } from "@/providers/ReportProvider";
import { ReportsList } from "@/components/reports/ReportsList";
import TOEFLScaleTable from "@/components/analysis/TOEFLScaleTable";
import { Logo } from "@/components/ui/logo";
export default function Home() {
  const { handleDataLoaded } = useReports();

  return (
    <div className="flex flex-col items-center justify-center gap-4 container mx-auto py-8">
      <Card className="w-full max-w-4xl mx-auto shadow-xl">
        <CardHeader className="text-center pb-8">
          <CardTitle
            className="text-4xl font-bold"
            style={{ color: "#be1522" }}
          >
            <div className="flex items-center justify-between">
              TOEFL Assessment Reports
              <Logo />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload New Report</TabsTrigger>
              <TabsTrigger value="view">View Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="upload">
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">
                    CSV Format Instructions
                  </h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      Required columns: Nombre, Apellido(s), READING, LISTENING,
                      SPEAKING, WRITING
                    </li>
                    <li>
                      Optional columns: FEEDBACK SPEAKING, FEEDBACK WRITING
                    </li>
                    <li>
                      Group information must be included in the filename: e.g.,
                      toefl_10A.csv, toefl_11B.csv
                    </li>
                    <li>Scores should be in the range 0-100</li>
                    <li>Use semicolon (;) as delimiter</li>
                    <li>Text encoding should be UTF-8</li>
                  </ul>
                </div>
                <CSVReader onDataLoaded={handleDataLoaded} />
              </div>
            </TabsContent>

            <TabsContent value="view">
              <ReportsList />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <TOEFLScaleTable />
    </div>
  );
}
