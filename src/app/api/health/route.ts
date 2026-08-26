import { NextResponse } from 'next/server';

function handler() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    podName: process.env.HOSTNAME,
  });
}

export { handler as GET };
