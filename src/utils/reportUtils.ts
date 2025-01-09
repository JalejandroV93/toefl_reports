import { ChartData, Level, StudentData } from "@/types";
import {
  getLevelForScore,
  getTotalLevel,
  TOTAL_SCORE_LEVELS,
} from "@/utils/scoreConversion";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import _ from "lodash";
import { getSkillAnalysis } from "@/utils/skillAnalysisUtils";
type SkillKey = "Reading" | "Listening" | "Speaking" | "Writing" | "Overall";

interface SkillDistribution {
  skill: string;
  C2?: number;
  C1?: number;
  B2?: number;
  B1?: number;
  A2?: number;
  average?: number;
}

export const generateStudentPDF = async (studentData: StudentData) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(18);
  doc.text(
    `Reporte Individual - ${studentData.Nombre} ${studentData["Apellido(s)"]}`,
    20,
    20
  );

  // Add Overall Level
  const overallLevel = calculateStudentOverallLevel(studentData);
  const totalScore =
    Number(studentData.READING || 0) +
    Number(studentData.LISTENING || 0) +
    Number(studentData.SPEAKING || 0) +
    Number(studentData.WRITING || 0);

  doc.setFontSize(14);
  doc.text(`Nivel General: ${overallLevel} (${totalScore}/120)`, 20, 30);

  // Skills scores
  doc.setFontSize(12);
  let yPos = 45; // Ajustado para dar espacio al Overall Level

  SKILLS.forEach((skill) => {
    const score = studentData[skill as keyof StudentData];
    if (typeof score === "number") {
      const level = getLevelForScore(score, skill);
      const analysis = getSkillAnalysis(skill, score);

      doc.text(`${skill}:`, 20, yPos);
      doc.text(`${score}/30 - Nivel ${level}`, 70, yPos);
      yPos += 7;
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(analysis, 170);
      doc.text(lines, 20, yPos);
      doc.setFontSize(12);
      yPos += 10 * lines.length + 5;
    }
  });

  // Feedback sections
  yPos += 10;
  doc.setFontSize(14);
  doc.text("Feedback y Recomendaciones", 20, yPos);
  yPos += 10;
  doc.setFontSize(12);

  const feedbackSections = ["SPEAKING", "WRITING"];
  feedbackSections.forEach((section) => {
    const feedback = studentData[`FEEDBACK ${section}` as keyof StudentData];
    if (feedback && typeof feedback === "string") {
      doc.text(`${section}:`, 20, yPos);
      yPos += 7;
      const lines = doc.splitTextToSize(feedback, 170);
      doc.text(lines, 20, yPos);
      yPos += 10 * lines.length + 5;
    }
  });

  return doc;
};

export const generateGeneralPDF = async (studentsData: StudentData[]) => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.text("Reporte General de Evaluación TOEFL", 20, 20);

  // General statistics
  const stats = calculateStatistics(studentsData);
  doc.setFontSize(12);
  let yPos = 40;

  doc.text(`Total de Estudiantes: ${stats.totalStudents}`, 20, yPos);
  yPos += 10;
  doc.text(`Promedio General: ${stats.averageScore.toFixed(2)}`, 20, yPos);
  yPos += 20;

  // Distribution table
  const distributionData = calculateLevelDistribution(studentsData);
  const tableData = distributionData.map((row) => [
    row.skill,
    row.C2,
    row.C1,
    row.B2,
    row.B1,
    row.A2,
    row.average?.toFixed(2) || "0",
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [["Habilidad", "C2", "C1", "B2", "B1", "A2", "Promedio"]],
    body: tableData,
  });

  // Recommendations
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  yPos = (doc as any).lastAutoTable.finalY + 20;
  doc.setFontSize(14);
  doc.text("Recomendaciones Generales", 20, yPos);
  yPos += 10;
  doc.setFontSize(12);

  const recommendations = generateGeneralRecommendations(distributionData);
  recommendations.forEach((rec) => {
    const lines = doc.splitTextToSize(rec, 170);
    doc.text(lines, 20, yPos);
    yPos += 10 * lines.length;
  });

  return doc;
};

const calculateStatistics = (studentsData: StudentData[]) => {
  let totalScore = 0;
  let scoreCount = 0;

  studentsData.forEach((student) => {
    SKILLS.forEach((skill) => {
      const score = student[skill as keyof StudentData];
      if (typeof score === "number" && !isNaN(score)) {
        totalScore += score;
        scoreCount++;
      }
    });
  });

  return {
    totalStudents: studentsData.length,
    averageScore: scoreCount > 0 ? totalScore / scoreCount : 0,
    scoreCount,
  };
};

const generateGeneralRecommendations = (
  distributionData: ChartData[]
): string[] => {
  const recommendations: string[] = [];
  const weakestSkill = _.minBy(distributionData, "average");
  const strongestSkill = _.maxBy(distributionData, "average");

  if (weakestSkill) {
    recommendations.push(
      `Se recomienda fortalecer ${weakestSkill.skill.toLowerCase()} con un promedio de ${
        weakestSkill.average
      }%. ` +
        `Implementar estrategias específicas de mejora y seguimiento continuo.`
    );
  }

  if (strongestSkill) {
    recommendations.push(
      `Mantener y potenciar el buen desempeño en ${strongestSkill.skill.toLowerCase()} ` +
        `aprovechando el nivel actual para desarrollo integral.`
    );
  }

  // General recommendations
  recommendations.push(
    "Implementar evaluaciones periódicas para monitorear el progreso.",
    "Desarrollar planes de estudio personalizados según niveles identificados.",
    "Fomentar la práctica integrada de todas las habilidades lingüísticas."
  );

  return recommendations;
};

export const calculateStudentOverallLevel = (
  studentData: StudentData
): Level => {
  // Calculamos el total sumando los puntajes de cada skill
  const scores = {
    READING: Number(studentData.READING) || 0,
    LISTENING: Number(studentData.LISTENING) || 0,
    SPEAKING: Number(studentData.SPEAKING) || 0,
    WRITING: Number(studentData.WRITING) || 0,
  };

  const totalScore = Object.values(scores).reduce(
    (sum, score) => sum + score,
    0
  );

  // Usamos los rangos definidos en TOTAL_SCORE_LEVELS
  for (const levelRange of TOTAL_SCORE_LEVELS) {
    if (totalScore >= levelRange.min && totalScore <= levelRange.max) {
      return levelRange.level as Level;
    }
  }

  return "A2"; // Nivel por defecto si no coincide con ningún rango
};

export const SKILLS = ["READING", "LISTENING", "SPEAKING", "WRITING"] as const;

export const calculateLevelDistribution = (
  studentsData: StudentData[]
): ChartData[] => {
  // Initialize distribution object with proper structure
  const initialDistribution = {
    Reading: {
      C2: 0,
      C1: 0,
      B2: 0,
      B1: 0,
      A2: 0,
      total: 0,
      average: 0,
    },
    Listening: {
      C2: 0,
      C1: 0,
      B2: 0,
      B1: 0,
      A2: 0,
      total: 0,
      average: 0,
    },
    Speaking: {
      C2: 0,
      C1: 0,
      B2: 0,
      B1: 0,
      A2: 0,
      total: 0,
      average: 0,
    },
    Writing: {
      C2: 0,
      C1: 0,
      B2: 0,
      B1: 0,
      A2: 0,
      total: 0,
      average: 0,
    },
    Overall: {
      C2: 0,
      C1: 0,
      B2: 0,
      B1: 0,
      A2: 0,
      total: 0,
      average: 0,
    },
  };

  // Calculate distributions
  const distribution = studentsData.reduce((acc, student) => {
    let totalScore = 0;
    let validSkillsCount = 0;

    // Process each skill
    SKILLS.forEach((skill) => {
      const score = Number(student[skill as keyof StudentData]);

      // Only process valid numeric scores
      if (!isNaN(score)) {
        const level = getLevelForScore(score, skill);
        const skillKey = (skill.charAt(0) +
          skill.slice(1).toLowerCase()) as SkillKey;

        // Update skill-specific statistics
        if (acc[skillKey]) {
          acc[skillKey].total++;
          acc[skillKey].average += score;
          acc[skillKey][level]++;
        }

        // Update overall statistics
        totalScore += score;
        validSkillsCount++;
      }
    });

    // Calculate and update overall statistics
    if (validSkillsCount > 0) {
      const overallAverage = totalScore / validSkillsCount;
      const overallLevel = getTotalLevel(overallAverage);

      acc.Overall.total++;
      acc.Overall.average += overallAverage;
      acc.Overall[overallLevel]++;
    }

    return acc;
  }, _.cloneDeep(initialDistribution));

  // Convert to ChartData format and calculate final averages
  return Object.entries(distribution).map(([skill, levels]) => ({
    skill,
    C2: levels.C2,
    C1: levels.C1,
    B2: levels.B2,
    B1: levels.B1,
    A2: levels.A2,
    average:
      levels.total > 0
        ? parseFloat((levels.average / levels.total).toFixed(2))
        : 0,
  }));
};

export const calculateSkillAverage = (
  skill: SkillDistribution,
  studentsCount: number
): number => {
  const skillTotal =
    (skill.C2 || 0) * 95 + // C2 = 95 points
    (skill.C1 || 0) * 85 + // C1 = 85 points
    (skill.B2 || 0) * 75 + // B2 = 75 points
    (skill.B1 || 0) * 65 + // B1 = 65 points
    (skill.A2 || 0) * 55; // A2 = 55 points

  return skillTotal / studentsCount;
};

export const calculateOverallAverage = (
  distributionData: SkillDistribution[],
  studentsCount: number
): number => {
  return (
    distributionData
      .filter((item) => item.skill !== "Overall")
      .reduce(
        (sum, skill) => sum + calculateSkillAverage(skill, studentsCount),
        0
      ) /
    (distributionData.length - 1)
  );
};

export const analyzeSkillPerformance = (
  skill: SkillDistribution,
  studentsCount: number
) => {
  return {
    skill: skill.skill,
    average: skill.average || 0,
    highLevelCount: (skill.C2 || 0) + (skill.C1 || 0) + (skill.B2 || 0),
    lowLevelCount: (skill.B1 || 0) + (skill.A2 || 0),
    performanceScore:
      ((skill.C2 || 0) * 5 + (skill.C1 || 0) * 4 + (skill.B2 || 0) * 3) /
      studentsCount,
    needsImprovement:
      (((skill.B1 || 0) + (skill.A2 || 0)) / studentsCount) * 100,
  };
};
