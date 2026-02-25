import { NextRequest } from 'next/server';

export function getIp(request: NextRequest): string | undefined {
  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    return xForwardedFor.split(',').shift();
  }
  return request.headers.get('x-real-ip') ?? request.ip;
}
