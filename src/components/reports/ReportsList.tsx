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
  FileDown,
  Download,
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
import { generateLinksCSV, downloadCSV } from "@/utils/exportUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Loader from "../ui/loader";
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

  const handleExportAllLinks = () => {
    const csv = generateLinksCSV(reports);
    downloadCSV(csv, "all_toefl_report_links.csv");
  };

  const handleExportGroupLinks = (groupReport: Report) => {
    const csv = generateLinksCSV([groupReport]);
    downloadCSV(csv, `toefl_report_links_${groupReport.group}.csv`);
  };

  if (loading) {
    return <Loader />;
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
      <div className="mb-4 flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              disabled={reports.length === 0}
            >
              <FileDown className="h-4 w-4" />
              Export Links
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleExportAllLinks}>
              Export All Groups
            </DropdownMenuItem>
            <DropdownMenuItem className="text-muted-foreground" disabled>
              Export by Group:
            </DropdownMenuItem>
            {reports.map((report) => (
              <DropdownMenuItem
                key={report.id}
                onClick={() => handleExportGroupLinks(report)}
              >
                Group: {report.group}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {reports.map((report) => (
        <Card key={report.id}>
          <CardContent className="pt-6">
            <Collapsible>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <FileBarChart className="h-5 w-5 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold">
                      Group: {report.group}
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

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleExportGroupLinks(report)}
                    title="Export group links"
                  >
                    <Download className="h-4 w-4" />
                  </Button>

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
                <div className="flex items-center justify-end mt-2">
                  <DeleteReportDialog
                    reportId={report.id}
                    onDelete={() => handleDeleteReport(report.id)}
                  />
                </div>
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
