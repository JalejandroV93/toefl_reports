// app/api/reports/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';

export async function POST(request: Request) {
  try {
    // Add CORS headers if needed
    const headers = {
      'Content-Type': 'application/json',
    };

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid JSON in request body' 
        },
        { status: 400, headers }
      );
    }

    const { group, studentsData, recommendations, distribution } = body;

    // Validate required fields
    if (!group || !studentsData || !Array.isArray(studentsData) || studentsData.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data: Missing required fields' 
        },
        { status: 400, headers }
      );
    }

    // Validate student data
    for (const student of studentsData) {
      if (!student.Nombre || !student['Apellido(s)']) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid student data: Missing name or lastname' 
          },
          { status: 400, headers }
        );
      }
    }

    // Create report in database
    const report = await prisma.report.create({
      data: {
        group,
        shareToken: nanoid(10),
        recommendations: JSON.stringify(recommendations || {}),
        distribution: JSON.stringify(distribution || []),
        students: {
          create: studentsData.map(student => ({
            name: student.Nombre,
            lastName: student['Apellido(s)'],
            reading: Number(student.READING) || 0,
            listening: Number(student.LISTENING) || 0,
            speaking: Number(student.SPEAKING) || 0,
            writing: Number(student.WRITING) || 0,
            speakingFeedback: student['FEEDBACK SPEAKING']?.toString() || '',
            writingFeedback: student['FEEDBACK WRITING']?.toString() || '',
            shareToken: nanoid(10),
            recommendations: JSON.stringify({})
          }))
        }
      },
      include: {
        students: true
      }
    });

    return NextResponse.json(
      { 
        success: true, 
        data: report 
      },
      { headers }
    );

  } catch (error) {
    console.error('Error in POST /api/reports:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
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