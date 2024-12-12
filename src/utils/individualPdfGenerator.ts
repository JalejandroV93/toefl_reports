import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { StudentData } from '@/types';
import { getLevelForScore, getSkillAnalysis } from './skillAnalysisUtils';

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
        getSkillAnalysis(skill, score)
      ];
    });

    autoTable(state.doc, {
      startY: state.yPos,
      head: [["Skill", "Score", "Level", "Analysis"]],
      body: tableData,
      theme: 'striped',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 20 },
        2: { cellWidth: 20 },
        3: { cellWidth: 'auto' }
      },
      margin: { left: this.MARGIN, right: this.MARGIN }
    });

    const autoTablePlugin = state.doc as jsPDF & { lastAutoTable: { finalY: number } };
    state.yPos = autoTablePlugin.lastAutoTable.finalY + 15;
  }

  private addDetailedFeedback(state: PageState, studentData: StudentData): void {
    this.checkPageBreak(state, 60);

    state.doc.setFontSize(16);
    state.doc.text("Detailed Feedback", this.MARGIN, state.yPos);
    state.yPos += 10;

    ['SPEAKING', 'WRITING'].forEach(skill => {
      this.checkPageBreak(state, 40);
      
      const feedback = studentData[`FEEDBACK ${skill}` as keyof StudentData];
      if (feedback && typeof feedback === "string") {
        state.doc.setFontSize(12);
        state.doc.text(`${skill}:`, this.MARGIN, state.yPos);
        state.yPos += 7;

        state.doc.setFontSize(10);
        const lines = state.doc.splitTextToSize(feedback, this.CONTENT_WIDTH);
        state.doc.text(lines, this.MARGIN, state.yPos);
        state.yPos += (lines.length * 5) + 10;
      }
    });
  }

  private addRecommendations(
    state: PageState, 
    recommendations: { [key: string]: string[] }
  ): void {
    this.checkPageBreak(state, 60);

    state.doc.setFontSize(16);
    state.doc.text("Recommendations", this.MARGIN, state.yPos);
    state.yPos += 10;

    Object.entries(recommendations).forEach(([skill, recs]) => {
      this.checkPageBreak(state, 40);
      
      state.doc.setFontSize(12);
      state.doc.text(`${skill}:`, this.MARGIN, state.yPos);
      state.yPos += 7;

      state.doc.setFontSize(10);
      recs.forEach(rec => {
        this.checkPageBreak(state, 10);
        const lines = state.doc.splitTextToSize(`• ${rec}`, this.CONTENT_WIDTH - 10);
        state.doc.text(lines, this.MARGIN + 5, state.yPos);
        state.yPos += (lines.length * 5) + 3;
      });
      
      state.yPos += 5;
    });
  }

  public generateIndividualReport(
    studentData: StudentData,
    recommendations: { [key: string]: string[] }
  ): jsPDF {
    const doc = new jsPDF();
    const state: PageState = { doc, yPos: this.MARGIN };

    this.addHeader(state, studentData);
    this.addSkillsProfile(state, studentData);
    this.addDetailedFeedback(state, studentData);
    this.addRecommendations(state, recommendations);

    return doc;
  }
}

export const individualPdfGenerator = new IndividualPDFGenerator();

export const generateIndividualReportPDF = (
  studentData: StudentData,
  recommendations: { [key: string]: string[] }
): jsPDF => {
  return individualPdfGenerator.generateIndividualReport(studentData, recommendations);
};