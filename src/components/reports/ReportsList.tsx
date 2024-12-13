// components/reports/ReportsList.tsx
"use client";

import { useEffect, useState } from "react";
import { reportService } from "@/services/reportService";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileBarChart,
  Users,
  Share2,
  Calendar,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DeleteReportDialog } from "./DeleteReportDialog";

interface Report {
  id: string;
  createdAt: Date;
  group: string;
  shareToken: string;
  students: {
    id: string;
    name: string;
    lastName: string;
    shareToken: string;
  }[];
}

export function ReportsList() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await reportService.getAllReports();
        setReports(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load reports");
        console.error("Error loading reports:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleDeleteReport = async (reportId: string) => {
    try {
      await reportService.deleteReport(reportId);
      setReports(reports.filter((report) => report.id !== reportId));
    } catch (error) {
      console.error("Error deleting report:", error);
      throw error;
    }
  };

  const getShareLink = (token: string, type: "report" | "student") => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/shared/${type}/${token}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!reports.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No reports found. Upload a CSV file to generate a new report.
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <Card key={report.id}>
          <CardContent className="pt-6">
            <Collapsible>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <FileBarChart className="h-5 w-5 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold">
                      Group {report.group}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(report.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share Report
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Share Report</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div>
                          <label className="text-sm font-medium">
                            General Report Link
                          </label>
                          <Input
                            value={getShareLink(report.shareToken, "report")}
                            readOnly
                            onClick={(e) => e.currentTarget.select()}
                          />
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </div>

              <CollapsibleContent className="mt-4">
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Students
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {report.students.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <span>
                          {student.name} {student.lastName}
                        </span>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Share Student Report</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                              <div>
                                <label className="text-sm font-medium">
                                  Individual Report Link
                                </label>
                                <Input
                                  value={getShareLink(
                                    student.shareToken,
                                    "student"
                                  )}
                                  readOnly
                                  onClick={(e) => e.currentTarget.select()}
                                />
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    ))}
                  </div>
                </div>
                <DeleteReportDialog
                  reportId={report.id}
                  onDelete={() => handleDeleteReport(report.id)}
                />
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      ))}

      {reports.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No reports found. Upload a CSV file to generate a new report.
        </div>
      )}
    </div>
  );
}
