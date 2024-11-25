import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { sessionId } = body;

  // Here you could save the sessionId to a database if needed
  console.log(`Session linked: ${sessionId}`);
  return NextResponse.json({ success: true });
}
