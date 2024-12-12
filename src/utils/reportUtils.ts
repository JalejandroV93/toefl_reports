import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { StudentData, ChartData, SkillLevelMapping, Level } from "@/types";
import _ from "lodash";

// export const SKILLS = ['READING', 'LISTENING', 'SPEAKING', 'WRITING'] as const;

// export const getLevelForScore = (score: number): Level => {
//   if (score >= 80) return "C1";
//   if (score >= 60) return "B2";
//   if (score >= 40) return "B1";
//   if (score >= 0) return "A2";
//   return "Below";
// };

// export const calculateLevelDistribution = (studentsData: StudentData[]): ChartData[] => {
//   const initialDistribution: SkillLevelMapping = {
//     Reading: { C1: 0, B2: 0, B1: 0, A2: 0, Below: 0, total: 0, average: 0 },
//     Listening: { C1: 0, B2: 0, B1: 0, A2: 0, Below: 0, total: 0, average: 0 },
//     Speaking: { C1: 0, B2: 0, B1: 0, A2: 0, Below: 0, total: 0, average: 0 },
//     Writing: { C1: 0, B2: 0, B1: 0, A2: 0, Below: 0, total: 0, average: 0 },
//     Overall: { C1: 0, B2: 0, B1: 0, A2: 0, Below: 0, total: 0, average: 0 }
//   };

//   const distribution = studentsData.reduce((acc, student) => {
//     let totalScore = 0;
//     let skillsCount = 0;

//     SKILLS.forEach((skill) => {
//       const score = student[skill as keyof StudentData];
//       if (typeof score === 'number' && !isNaN(score)) {
//         const level = getLevelForScore(score);
//         const skillKey = skill.toLowerCase();
//         acc[skillKey].total++;
//         acc[skillKey].average += score;
//         acc[skillKey][level]++;

//         totalScore += score;
//         skillsCount++;
//       }
//     });

//     if (skillsCount > 0) {
//       const overallAverage = totalScore / skillsCount;
//       const overallLevel = getLevelForScore(overallAverage);
//       acc.Overall[overallLevel]++;
//       acc.Overall.total++;
//       acc.Overall.average += overallAverage;
//     }

//     return acc;
//   }, _.cloneDeep(initialDistribution));

//   // Calculate final averages and convert to ChartData format
//   return Object.entries(distribution).map(([skill, levels]) => ({
//     skill,
//     C1: levels.C1,
//     B2: levels.B2,
//     B1: levels.B1,
//     A2: levels.A2,
//     Below: levels.Below,
//     average: levels.total > 0 ? Number((levels.average / levels.total).toFixed(2)) : 0
//   }));
// };

// export const getSkillAnalysis = (skillName: string, score: number): string => {
//   const level = getLevelForScore(score);
//   const analyses = {
//     READING: {
//       C1: "Excelente comprensión lectora. Puede manejar textos académicos complejos.",
//       B2: "Buena comprensión de textos avanzados. Algunas dificultades con vocabulario técnico.",
//       B1: "Comprensión básica de textos generales. Necesita mejorar velocidad y vocabulario.",
//       A2: "Comprensión limitada. Requiere desarrollo de estrategias de lectura.",
//       Below: "Necesita apoyo intensivo en comprensión lectora."
//     },
//     LISTENING: {
//       C1: "Excelente comprensión auditiva en diversos contextos.",
//       B2: "Buena comprensión en la mayoría de situaciones.",
//       B1: "Comprensión moderada. Dificultades con acentos y velocidad.",
//       A2: "Comprensión básica. Necesita exposición a más material auditivo.",
//       Below: "Requiere práctica intensiva en comprensión auditiva."
//     },
//     SPEAKING: {
//       C1: "Comunicación fluida y natural en diversos contextos.",
//       B2: "Buena fluidez con algunos errores menores.",
//       B1: "Comunicación básica efectiva. Necesita mejorar fluidez.",
//       A2: "Comunicación limitada. Requiere más práctica oral.",
//       Below: "Necesita desarrollo intensivo de habilidades orales."
//     },
//     WRITING: {
//       C1: "Excelente expresión escrita en diversos géneros.",
//       B2: "Buena capacidad de escritura con estructura clara.",
//       B1: "Escritura básica efectiva. Necesita mejorar organización.",
//       A2: "Escritura limitada. Requiere desarrollo de estructura.",
//       Below: "Necesita apoyo intensivo en expresión escrita."
//     }
//   };

//   return analyses[skillName as keyof typeof analyses]?.[level as keyof typeof analyses.READING] ||
//          "Análisis no disponible";
// };

export const generateStudentPDF = async (studentData: StudentData) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(18);
  doc.text(
    `Reporte Individual - ${studentData.Nombre} ${studentData["Apellido(s)"]}`,
    20,
    20
  );

  // Skills scores
  doc.setFontSize(12);
  let yPos = 40;

  SKILLS.forEach((skill) => {
    const score = studentData[skill as keyof StudentData];
    if (typeof score === "number") {
      const level = getLevelForScore(score);
      const analysis = getSkillAnalysis(skill, score);

      doc.text(`${skill}:`, 20, yPos);
      doc.text(`${score}/100 - Nivel ${level}`, 70, yPos);
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
    row.C1,
    row.B2,
    row.B1,
    row.A2,
    row.Below,
    row.average?.toFixed(2) || "0",
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [["Habilidad", "C1", "B2", "B1", "A2", "Below", "Promedio"]],
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
  let totalScore = 0;
  let scoreCount = 0;

  SKILLS.forEach((skill) => {
    const score = studentData[skill as keyof StudentData];
    if (typeof score === "number" && !isNaN(score)) {
      totalScore += score;
      scoreCount++;
    }
  });

  const averageScore = scoreCount > 0 ? totalScore / scoreCount : 0;
  return getLevelForScore(averageScore);
};

// // utils/reportUtils.ts
// import { StudentData, ChartData, SkillLevelMapping, Level } from "@/types";
// import _ from "lodash";

export const SKILLS = ["READING", "LISTENING", "SPEAKING", "WRITING"] as const;

export const getLevelForScore = (score: number): Level => {
  if (score >= 80) return "C1";
  if (score >= 60) return "B2";
  if (score >= 40) return "B1";
  if (score >= 0) return "A2";
  return "Below";
};

export const calculateLevelDistribution = (
  studentsData: StudentData[]
): ChartData[] => {
  // Initialize distribution object with proper structure
  const initialDistribution: SkillLevelMapping = {
    Reading: { C1: 0, B2: 0, B1: 0, A2: 0, Below: 0, total: 0, average: 0 },
    Listening: { C1: 0, B2: 0, B1: 0, A2: 0, Below: 0, total: 0, average: 0 },
    Speaking: { C1: 0, B2: 0, B1: 0, A2: 0, Below: 0, total: 0, average: 0 },
    Writing: { C1: 0, B2: 0, B1: 0, A2: 0, Below: 0, total: 0, average: 0 },
    Overall: { C1: 0, B2: 0, B1: 0, A2: 0, Below: 0, total: 0, average: 0 },
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
        const level = getLevelForScore(score);
        const skillKey = skill.charAt(0) + skill.slice(1).toLowerCase();

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
      const overallLevel = getLevelForScore(overallAverage);

      acc.Overall.total++;
      acc.Overall.average += overallAverage;
      acc.Overall[overallLevel]++;
    }

    return acc;
  }, _.cloneDeep(initialDistribution));

  // Convert to ChartData format and calculate final averages
  return Object.entries(distribution).map(([skill, levels]) => ({
    skill,
    C1: levels.C1,
    B2: levels.B2,
    B1: levels.B1,
    A2: levels.A2,
    Below: levels.Below,
    average:
      levels.total > 0
        ? parseFloat((levels.average / levels.total).toFixed(2))
        : 0,
  }));
};

export const getSkillAnalysis = (skillName: string, score: number): string => {
  const level = getLevelForScore(score);

  const analyses = {
    READING: {
      C1: "Excelente comprensión lectora. Puede manejar textos académicos complejos.",
      B2: "Buena comprensión de textos avanzados. Algunas dificultades con vocabulario técnico.",
      B1: "Comprensión básica de textos generales. Necesita mejorar velocidad y vocabulario.",
      A2: "Comprensión limitada. Requiere desarrollo de estrategias de lectura.",
      Below: "Necesita apoyo intensivo en comprensión lectora.",
    },
    LISTENING: {
      C1: "Excelente comprensión auditiva en diversos contextos.",
      B2: "Buena comprensión en la mayoría de situaciones.",
      B1: "Comprensión moderada. Dificultades con acentos y velocidad.",
      A2: "Comprensión básica. Necesita exposición a más material auditivo.",
      Below: "Requiere práctica intensiva en comprensión auditiva.",
    },
    SPEAKING: {
      C1: "Comunicación fluida y natural en diversos contextos.",
      B2: "Buena fluidez con algunos errores menores.",
      B1: "Comunicación básica efectiva. Necesita mejorar fluidez.",
      A2: "Comunicación limitada. Requiere más práctica oral.",
      Below: "Necesita desarrollo intensivo de habilidades orales.",
    },
    WRITING: {
      C1: "Excelente expresión escrita en diversos géneros.",
      B2: "Buena capacidad de escritura con estructura clara.",
      B1: "Escritura básica efectiva. Necesita mejorar organización.",
      A2: "Escritura limitada. Requiere desarrollo de estructura.",
      Below: "Necesita apoyo intensivo en expresión escrita.",
    },
  };

  return (
    analyses[skillName as keyof typeof analyses]?.[
      level as keyof typeof analyses.READING
    ] || "Análisis no disponible"
  );
};
