// services/server/reportService.ts
import { prisma } from '@/lib/prisma';
import { Report } from '@/types/report';

export class ServerReportService {
  async getReportByToken(token: string): Promise<Report | null> {
    try {
      const report = await prisma.report.findUnique({
        where: { shareToken: token },
        include: { 
          students: true
        }
      });
      
      return report as Report | null;
    } catch (error) {
      console.error('Error fetching report by token:', error);
      return null;
    }
  }

  async getStudentReportByToken(token: string) {
    try {
      const student = await prisma.student.findUnique({
        where: { shareToken: token },
        include: {
          report: {
            select: {
              group: true,
              createdAt: true
            }
          }
        }
      });

      return student;
    } catch (error) {
      console.error('Error fetching student report by token:', error);
      return null;
    }
  }
}

export const serverReportService = new ServerReportService();