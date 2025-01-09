export const generateLinksCSV = (
  reports: {
    id: string;
    group: string;
    shareToken: string;
    students: {
      name: string;
      lastName: string;
      shareToken: string;
    }[];
  }[]
): string => {
  const rows = ["Group,Student,Type,Link"];

  reports.forEach((report) => {
    // Add general report link
    rows.push(
      `${report.group},General Report,Group,${window.location.origin}/shared/report/${report.shareToken}`
    );

    // Add individual student links
    report.students.forEach((student) => {
      rows.push(
        `${report.group},${student.name} ${student.lastName},Individual,${window.location.origin}/shared/student/${student.shareToken}`
      );
    });
  });

  return rows.join("\n");
};

export const downloadCSV = (content: string, filename: string) => {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};
