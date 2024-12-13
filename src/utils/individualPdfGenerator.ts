import { StudentData } from '@/types';
import { Recommendations } from '@/types/recommendations';
import { getLevelForScore } from '@/utils/skillAnalysisUtils';
// utils/individualPdfGenerator.ts
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PageState {
  yPos: number;
  doc: jsPDF;
}

class IndividualPDFGenerator {
  private readonly PAGE_WIDTH = 210;
  private readonly PAGE_HEIGHT = 297;
  private readonly MARGIN = 20;
  private readonly CONTENT_WIDTH = this.PAGE_WIDTH - (2 * this.MARGIN);

  private checkPageBreak(state: PageState, requiredSpace: number): void {
    if (state.yPos + requiredSpace > this.PAGE_HEIGHT - this.MARGIN) {
      state.doc.addPage();
      state.yPos = this.MARGIN;
    }
  }

  private addHeader(state: PageState, studentData: StudentData): void {
    state.doc.setFontSize(24);
    state.doc.setTextColor(33, 33, 33);
    const title = "Individual TOEFL Assessment Report";
    state.doc.text(title, this.MARGIN, state.yPos);
    state.yPos += 15;

    state.doc.setFontSize(14);
    state.doc.text(`Student: ${studentData.Nombre} ${studentData["Apellido(s)"]}`, this.MARGIN, state.yPos);
    state.yPos += 10;

    const date = new Date().toLocaleDateString('en-US');
    state.doc.text(`Date: ${date}`, this.MARGIN, state.yPos);
    state.yPos += 20;
  }

  private addSkillsProfile(state: PageState, studentData: StudentData): void {
    this.checkPageBreak(state, 100);

    state.doc.setFontSize(16);
    state.doc.text("Skills Profile", this.MARGIN, state.yPos);
    state.yPos += 10;

    const skills = ['READING', 'LISTENING', 'SPEAKING', 'WRITING'];
    const tableData = skills.map(skill => {
      const score = studentData[skill as keyof StudentData] as number;
      return [
        skill,
        score.toString(),
        getLevelForScore(score),
      ];
    });

    autoTable(state.doc, {
      startY: state.yPos,
      head: [["Skill", "Score", "Level"]],
      body: tableData,
      theme: 'striped',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 25 },
        2: { cellWidth: 25 }
      },
      margin: { left: this.MARGIN, right: this.MARGIN }
    });

    const autoTablePlugin = state.doc as jsPDF & { lastAutoTable: { finalY: number } };
    state.yPos = autoTablePlugin.lastAutoTable.finalY + 15;
  }

  private addRecommendations(
    state: PageState, 
    recommendations: Recommendations
  ): void {
    this.checkPageBreak(state, 60);

    state.doc.setFontSize(16);
    state.doc.text("Recommendations & Analysis", this.MARGIN, state.yPos);
    state.yPos += 10;

    Object.entries(recommendations).forEach(([skill, rec]) => {
      this.checkPageBreak(state, 40);
      
      // Skill Header
      state.doc.setFontSize(14);
      state.doc.text(skill, this.MARGIN, state.yPos);
      state.yPos += 7;

      // Strengths
      if (rec.strengths && rec.strengths.length > 0) {
        state.doc.setFontSize(12);
        state.doc.text("Strengths:", this.MARGIN + 5, state.yPos);
        state.yPos += 5;
        state.doc.setFontSize(10);
        rec.strengths.forEach(strength => {
          const lines = state.doc.splitTextToSize(`• ${strength}`, this.CONTENT_WIDTH - 10);
          this.checkPageBreak(state, lines.length * 5);
          state.doc.text(lines, this.MARGIN + 10, state.yPos);
          state.yPos += lines.length * 5;
        });
        state.yPos += 5;
      }

      // Weaknesses
      if (rec.weaknesses && rec.weaknesses.length > 0) {
        this.checkPageBreak(state, 20);
        state.doc.setFontSize(12);
        state.doc.text("Areas for Improvement:", this.MARGIN + 5, state.yPos);
        state.yPos += 5;
        state.doc.setFontSize(10);
        rec.weaknesses.forEach(weakness => {
          const lines = state.doc.splitTextToSize(`• ${weakness}`, this.CONTENT_WIDTH - 10);
          this.checkPageBreak(state, lines.length * 5);
          state.doc.text(lines, this.MARGIN + 10, state.yPos);
          state.yPos += lines.length * 5;
        });
        state.yPos += 5;
      }

      // Recommended Actions
      if (rec.shortTermActions && rec.shortTermActions.length > 0) {
        this.checkPageBreak(state, 20);
        state.doc.setFontSize(12);
        state.doc.text("Recommended Actions:", this.MARGIN + 5, state.yPos);
        state.yPos += 5;
        state.doc.setFontSize(10);
        rec.shortTermActions.forEach(action => {
          const lines = state.doc.splitTextToSize(`• ${action}`, this.CONTENT_WIDTH - 10);
          this.checkPageBreak(state, lines.length * 5);
          state.doc.text(lines, this.MARGIN + 10, state.yPos);
          state.yPos += lines.length * 5;
        });
      }
      
      state.yPos += 10; // Space between skills
    });
  }

  public generateIndividualReport(
    studentData: StudentData,
    recommendations: Recommendations
  ): jsPDF {
    const doc = new jsPDF();
    const state: PageState = { doc, yPos: this.MARGIN };

    this.addHeader(state, studentData);
    this.addSkillsProfile(state, studentData);
    this.addRecommendations(state, recommendations);

    return doc;
  }
}

export const individualPdfGenerator = new IndividualPDFGenerator();

export const generateIndividualReportPDF = (
  studentData: StudentData,
  recommendations: Recommendations
): jsPDF => {
  return individualPdfGenerator.generateIndividualReport(studentData, recommendations);
};