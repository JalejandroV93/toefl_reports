// services/reportService.ts
import { StudentData } from '@/types';
import { Report } from '@/types/report';
import { reportFactoryService } from './reportFactoryService';

export interface CreateReportDTO {
  group: string;
  studentsData: StudentData[];
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}

class ReportService {
  private readonly API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get("content-type");

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        if (contentType?.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
        } else {
          const text = await response.text();
          errorMessage = `Server error: ${text.substring(0, 200)}...`;
        }
      } catch (e) {
        errorMessage = `Failed to parse error response: ${e}`;
      }
      throw new Error(errorMessage);
    }

    if (!contentType?.includes("application/json")) {
      throw new Error(`Invalid content type: ${contentType}`);
    }

    const result = (await response.json()) as APIResponse<T>;
    if (!result.success && result.error) {
      throw new Error(result.error);
    }

    return result.data as T;
  }

  async createReport(data: CreateReportDTO) {
    try {
      // Validate input data
      if (!data.group || !data.studentsData || data.studentsData.length === 0) {
        throw new Error("Invalid report data: Missing required fields");
      }

      // Generate all necessary data using the factory service
      const generatedData = await reportFactoryService.generateReportData(
        data.studentsData
      );

      // Normalize student data and add generated individual recommendations
      const normalizedStudents = data.studentsData.map((student, index) => ({
        name: student.Nombre,
        lastName: student["Apellido(s)"],
        reading: Number(student.READING) || 0, // Ensure numeric and default to 0
        listening: Number(student.LISTENING) || 0,
        speaking: Number(student.SPEAKING) || 0,
        writing: Number(student.WRITING) || 0,
        speakingFeedback: student["FEEDBACK SPEAKING"]?.toString() || "", // Handle possible null/undefined
        writingFeedback: student["FEEDBACK WRITING"]?.toString() || "",
        recommendations: JSON.stringify(
          generatedData.recommendations.individual[index] || {}
        ), // Important: Default to {}
      }));

      const response = await fetch(`${this.API_BASE_URL}/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          group: data.group,
          studentsData: normalizedStudents,
          recommendations: JSON.stringify(
            generatedData.recommendations.general || {}
          ), // Default to {}
          distribution: JSON.stringify(generatedData.distribution || []), // Default to []
          analysis: JSON.stringify(generatedData.analysis || {}),
        }),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error in createReport:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to create report"
      );
    }
  }

  async getReportByToken(token: string): Promise<Report | null> {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}/shared/report/${token}`
      );

      if (response.status === 404) return null;

      const result = await this.handleResponse<Report>(response);
      return result;
    } catch (error) {
      console.error("Error in getReportByToken:", error);
      throw new Error("Failed to fetch report");
    }
  }

  async getStudentReportByToken(token: string) {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}/shared/student/${token}`
      );
      if (response.status === 404) return null;
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error in getStudentReportByToken:", error);
      throw new Error("Failed to fetch student report");
    }
  }

  async getAllReports(): Promise<Report[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/reports`);
      return await this.handleResponse<Report[]>(response);
    } catch (error) {
      console.error("Error in getAllReports:", error);
      throw error instanceof Error
        ? error
        : new Error("Failed to fetch reports");
    }
  }

  async deleteReport(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/reports/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete report");
      }

      await response.json();
    } catch (error) {
      console.error("Error deleting report:", error);
      throw error;
    }
  }
}

export const reportService = new ReportService();