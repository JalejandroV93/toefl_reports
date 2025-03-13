// app/api/reports/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON in request body" },
        { status: 400, headers }
      );
    }

    const { group, studentsData, recommendations, distribution } = body;

    // Enhanced Validation
    if (
      !group ||
      !studentsData ||
      !Array.isArray(studentsData) ||
      studentsData.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request data: Missing required fields",
        },
        { status: 400, headers }
      );
    }

    for (const student of studentsData) {
      if (!student.name || !student.lastName) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Student data validation failed: Each student must have name and lastName",
          },
          { status: 400, headers }
        );
      }
    }

    // Create report with default values for potentially null fields
    const report = await prisma.report.create({
      data: {
        group,
        shareToken: nanoid(10),
        recommendations: JSON.stringify(recommendations || {}), // Default to empty object
        distribution: JSON.stringify(distribution || []), // Default to empty array
        students: {
          create: studentsData.map((student) => ({
            name: student.name,
            lastName: student.lastName,
            reading: Number(student.reading) || 0,
            listening: Number(student.listening) || 0,
            speaking: Number(student.speaking) || 0,
            writing: Number(student.writing) || 0,
            speakingFeedback: student.speakingFeedback || "", // Default to empty string
            writingFeedback: student.writingFeedback || "", // Default to empty string
            shareToken: nanoid(10),
            recommendations: JSON.stringify(student.recommendations || {}), // Default to empty object
          })),
        },
      },
      include: {
        students: true,
      },
    });

    return NextResponse.json({ success: true, data: report }, { headers });
  } catch (error) {
    // Improved error handling: Log the *entire* error object, including stack trace
    console.error("Error in POST /api/reports:", error);

    // Return a more informative error message to the client
    let errorMessage = "Internal server error";
    let errorDetails = "Unknown error";

    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = error.stack || "No stack trace available"; // Include stack trace if available
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: errorDetails,
      },
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function GET() {
  try {
    const reports = await prisma.report.findMany({
      include: {
        students: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(
      { 
        success: true, 
        data: reports 
      },
      { 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error fetching reports:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch reports',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}