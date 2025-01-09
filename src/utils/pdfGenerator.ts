// utils/pdfGenerator.ts
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { StudentData, ChartData } from '@/types';
import { calculateLevelDistribution } from './reportUtils';

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 20;
const CONTENT_WIDTH = PAGE_WIDTH - (2 * MARGIN);

interface PageState {
  yPos: number;
  doc: jsPDF;
}

class PDFGenerator {
  private checkPageBreak(state: PageState, requiredSpace: number): void {
    if (state.yPos + requiredSpace > PAGE_HEIGHT - MARGIN) {
      state.doc.addPage();
      state.yPos = MARGIN;
    }
  }

  private addHeader(state: PageState, title: string): void {
    state.doc.setFontSize(24);
    state.doc.setTextColor(33, 33, 33);
    state.doc.text(title, MARGIN, state.yPos);
    state.yPos += 20;
  }

  private addExecutiveSummary(
    state: PageState,
    studentsData: StudentData[],
    distributionData: ChartData[]
  ): void {
    this.checkPageBreak(state, 80); // Estimated space needed

    state.doc.setFontSize(16);
    state.doc.setTextColor(33, 33, 33);
    state.doc.text("Executive Summary", MARGIN, state.yPos);
    state.yPos += 15;

    const overallData = distributionData.find(item => item.skill === "Overall");
    const skillsData = distributionData.filter(item => item.skill !== "Overall");
    const highestSkill = skillsData.reduce((prev, current) => 
      (current.average || 0) > (prev.average || 0) ? current : prev
    );
    const lowestSkill = skillsData.reduce((prev, current) => 
      (current.average || 0) < (prev.average || 0) ? current : prev
    );

    state.doc.setFontSize(11);
    state.doc.setTextColor(51, 51, 51);
    const summaryLines = [
      `Analysis based on the evaluation of ${studentsData.length} students.`,
      `Overall average: ${(overallData?.average || 0).toFixed(2)}%.`,
      `Highest performance in ${highestSkill.skill} (${highestSkill.average?.toFixed(2)}%).`,
      `Lowest performance in ${lowestSkill.skill} (${lowestSkill.average?.toFixed(2)}%).`
    ];

    summaryLines.forEach(line => {
      this.checkPageBreak(state, 7);
      state.doc.text(line, MARGIN, state.yPos);
      state.yPos += 7;
    });

    state.yPos += 10;
  }

  private addDistributionTable(
    state: PageState,
    distributionData: ChartData[]
  ): void {
    this.checkPageBreak(state, 100); // Estimated space for table

    state.doc.setFontSize(16);
    state.doc.setTextColor(33, 33, 33);
    state.doc.text("Skills Distribution", MARGIN, state.yPos);
    state.yPos += 10;

    const tableData = distributionData.map(row => [
      row.skill,
      row.C1,
      row.B2,
      row.B1,
      row.A2,
      (row.average || 0).toFixed(2)
    ]);

    autoTable(state.doc, {
      startY: state.yPos,
      head: [['Skill', 'C2', 'C1', 'B2', 'B1', 'A2', 'Average']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontSize: 12,
        fontStyle: 'bold'
      },
      bodyStyles: { fontSize: 11 },
      styles: { cellPadding: 5 },
      margin: { left: MARGIN, right: MARGIN }
    });

    const autoTablePlugin = state.doc as jsPDF & { lastAutoTable: { finalY: number } };
    state.yPos = autoTablePlugin.lastAutoTable.finalY + 15;
  }

  private addDetailedAnalysis(
    state: PageState,
    distributionData: ChartData[]
  ): void {
    this.checkPageBreak(state, 40);

    state.doc.setFontSize(16);
    state.doc.setTextColor(33, 33, 33);
    state.doc.text("Detailed Analysis", MARGIN, state.yPos);
    state.yPos += 15;

    state.doc.setFontSize(11);
    state.doc.setTextColor(51, 51, 51);

    distributionData
      .filter(item => item.skill !== "Overall")
      .forEach(skill => {
        this.checkPageBreak(state, 30);

        const analysisText = `${skill.skill} - Average: ${skill.average?.toFixed(2)}%\n` +
          `Distribution: C2: ${skill.C2}, C1: ${skill.C1}, B2: ${skill.B2}, B1: ${skill.B1}, A2: ${skill.A2}`;

        const lines = state.doc.splitTextToSize(analysisText, CONTENT_WIDTH);
        state.doc.text(lines, MARGIN, state.yPos);
        state.yPos += (lines.length * 7) + 10;
      });
  }

  private addRecommendations(
    state: PageState,
    recommendations: {
      shortTermActions: string[];
      longTermStrategy: string[];
    }
  ): void {
    this.checkPageBreak(state, 40);

    state.doc.setFontSize(16);
    state.doc.setTextColor(33, 33, 33);
    state.doc.text("General Recommendations", MARGIN, state.yPos);
    state.yPos += 15;

    // Short-term Actions
    state.doc.setFontSize(12);
    state.doc.setTextColor(51, 51, 51);
    state.doc.text("Short-term Actions", MARGIN, state.yPos);
    state.yPos += 10;

    state.doc.setFontSize(11);
    recommendations.shortTermActions.forEach(action => {
      this.checkPageBreak(state, 10);
      const lines = state.doc.splitTextToSize(`• ${action}`, CONTENT_WIDTH);
      state.doc.text(lines, MARGIN, state.yPos);
      state.yPos += (lines.length * 7);
    });

    state.yPos += 10;

    // Long-term Strategy
    this.checkPageBreak(state, 40);
    state.doc.setFontSize(12);
    state.doc.text("Long-term Strategy", MARGIN, state.yPos);
    state.yPos += 10;

    state.doc.setFontSize(11);
    recommendations.longTermStrategy.forEach(strategy => {
      this.checkPageBreak(state, 10);
      const lines = state.doc.splitTextToSize(`• ${strategy}`, CONTENT_WIDTH);
      state.doc.text(lines, MARGIN, state.yPos);
      state.yPos += (lines.length * 7);
    });
  }

  public generateGeneralReport(
    studentsData: StudentData[],
    recommendations: {
      shortTermActions: string[];
      longTermStrategy: string[];
    }
  ): jsPDF {
    const doc = new jsPDF();
    const state: PageState = { doc, yPos: MARGIN };
    const distributionData = calculateLevelDistribution(studentsData);

    this.addHeader(state, "TOEFL Assessment General Report");
    this.addExecutiveSummary(state, studentsData, distributionData);
    this.addDistributionTable(state, distributionData);
    this.addDetailedAnalysis(state, distributionData);
    this.addRecommendations(state, recommendations);

    return doc;
  }
}

export const pdfGenerator = new PDFGenerator();

export const generateGeneralReportPDF = (
  studentsData: StudentData[],
  recommendations: { shortTermActions: string[]; longTermStrategy: string[]; }
): jsPDF => {
  return pdfGenerator.generateGeneralReport(studentsData, recommendations);
};