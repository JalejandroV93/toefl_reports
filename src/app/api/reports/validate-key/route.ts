import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { deleteKey } = await request.json();

  if (deleteKey !== process.env.DELETE_KEY) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  return NextResponse.json({ valid: true });
}
