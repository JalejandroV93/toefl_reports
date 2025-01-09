// app/api/shared/[type]/[token]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { type: string; token: string } }
) {
  try {
    const { type, token } = await params;
    //console.log("Getting shared api report by token:", token);

    if (type === 'report') {
      const report = await prisma.report.findUnique({
        where: { shareToken: token },
        include: { students: true }
      });

      if (!report) {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: report });
    }

    if (type === 'student') {
      const student = await prisma.student.findUnique({
        where: { shareToken: token },
        include: {
          report: {
            select: {
              group: true,
              createdAt: true
            }
          }
        }
      });

      if (!student) {
        return NextResponse.json({ error: 'Student report not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: student });
    }

    return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching shared report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 }
    );
  }
}