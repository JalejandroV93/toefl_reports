// app/api/reports/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400, headers }
      );
    }

    const { group, studentsData, recommendations, distribution } = body;

    // Validación mejorada
    if (!group || !studentsData || !Array.isArray(studentsData) || studentsData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data: Missing required fields' },
        { status: 400, headers }
      );
    }

    // Validar datos del estudiante
    for (const student of studentsData) {
      if (!student.name || !student.lastName) {
        return NextResponse.json(
          { success: false, error: 'Student data validation failed: Each student must have name and lastName' },
          { status: 400, headers }
        );
      }
    }

    // Crear reporte
    const report = await prisma.report.create({
      data: {
        group,
        shareToken: nanoid(10),
        generalRecommendations: JSON.stringify(recommendations || {}),
        distribution: JSON.stringify(distribution || []),
        students: {
          create: studentsData.map(student => ({
            name: student.name,
            lastName: student.lastName,
            reading: Number(student.reading) || 0,
            listening: Number(student.listening) || 0,
            speaking: Number(student.speaking) || 0,
            writing: Number(student.writing) || 0,
            speakingFeedback: student.speakingFeedback || '',
            writingFeedback: student.writingFeedback || '',
            shareToken: nanoid(10),
            recommendations: student.recommendations || '{}'
          }))
        }
      },
      include: {
        students: true
      }
    });

    return NextResponse.json({ success: true, data: report }, { headers });
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