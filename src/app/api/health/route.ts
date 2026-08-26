import { NextResponse } from 'next/server';

function handler() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}

export { handler as GET };
