// app/api/reports/[token]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const report = await prisma.report.findUnique({
      where: { shareToken: params.token },
      include: { students: true }
    });

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 }
    );
  }
}

//Add Delete Reports
export async function DELETE(
  _: Request,
  { params }: { params: { token: string } }
) {
  try {
    const report = await prisma.report.delete({
      where: { shareToken: params.token }
    });
    console.log('Deleting report:', params.token);


    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting report:', error);
    return NextResponse.json(
      { error: 'Failed to delete report' },
      { status: 500 }
    );
  }
}