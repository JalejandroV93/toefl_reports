// app/api/reports/[token]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {

    const { token } = params;

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    
    const report = await prisma.report.findUnique({
      where: { shareToken: token },
      include: { students: true },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error fetching report:", error);
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: 500 }
    );
  }
}

//Add Delete Reports

export async function DELETE(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Primero eliminar los estudiantes relacionados
    await prisma.student.deleteMany({
      where: { reportId: token },
    });

    // Luego eliminar el reporte
    await prisma.report.delete({
      where: { id: token },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      "Error deleting report:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return NextResponse.json(
      { error: "Failed to delete report" },
      { status: 500 }
    );
  }
}
