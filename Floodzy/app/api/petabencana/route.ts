import { NextRequest, NextResponse } from 'next/server';
import { getIp } from '@/src/lib/getIp';
import { rateLimit } from '@/src/lib/rateLimiter';
import { getCache, setCache } from '@/src/lib/cache';
import * as Sentry from "@sentry/nextjs";
import { logApi, now } from '@/src/lib/logger';
import { getRequestId } from "@/src/lib/requestId";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const start = now();
  const ip = getIp(request);
  const requestId = getRequestId(request.headers);
  const cacheKey = `cache:petabencana:${request.url}`;

  let status = 200;
  let cacheStatus: "HIT" | "MISS" | "BYPASS" = "BYPASS";
  let rlRemaining: number | undefined;
  let errorMsg: string | undefined;

  try {
    // Check cache first
    const cachedResponse = await getCache(cacheKey);
    if (cachedResponse) {
      cacheStatus = "HIT";
      const response = NextResponse.json(cachedResponse);
      response.headers.set('X-Cache', cacheStatus);
      response.headers.set('X-Request-Id', requestId);
      return response;
    }

    // Apply rate limiting
    if (ip) {
      const { allowed, limit, remaining, reset } = await rateLimit(`petabencana_rate_limit:${ip}`);
      rlRemaining = remaining;
      const headers = {
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': String(remaining),
        'X-RateLimit-Reset': String(reset),
      };

      if (!allowed) {
        status = 429;
        errorMsg = "Too Many Requests";
        const response = new NextResponse('Too Many Requests', { status: 429, headers });
        response.headers.set('X-Request-Id', requestId);
        return response;
      }
      // Add rate limit headers to the response if allowed
      Object.assign(request.headers, headers);
    }

    // Simulate fetching data
    const data = {
      message: "Data from Peta Bencana API",
      timestamp: new Date().toISOString(),
      query: request.url,
    };

    // Cache the response
    await setCache(cacheKey, data, { ttl: 60 });
    cacheStatus = "MISS";

    const response = NextResponse.json(data);
    response.headers.set('X-Cache', cacheStatus);
    response.headers.set('X-Request-Id', requestId);
    // Add rate limit headers if they were set in the request headers
    if (ip) {
      const { limit, remaining, reset } = await rateLimit(`petabencana_rate_limit:${ip}`);
      response.headers.set('X-RateLimit-Limit', String(limit));
      response.headers.set('X-RateLimit-Remaining', String(remaining));
      response.headers.set('X-RateLimit-Reset', String(reset));
    }
    return response;

  } catch (e: any) {
    Sentry.captureException(e);
    status = e?.status || 500;
    errorMsg = e?.message || "Internal Server Error";
    console.error('API Error:', e);
    const r = NextResponse.json(
      { error: errorMsg },
      { status: status }
    );
    r.headers.set('X-Request-Id', requestId);
    // If it's a rate limit error, add the headers
    if (e.name === "RateLimitError") {
      r.headers.set("X-RateLimit-Limit", String(e.limit));
      r.headers.set("X-RateLimit-Remaining", String(e.remaining));
      r.headers.set("X-RateLimit-Reset", String(e.reset));
    }
    return r;
  } finally {
    logApi({
      route: "/api/petabencana",
      method: "GET",
      status: status,
      ip: ip,
      cache: cacheStatus,
      rlRemaining: rlRemaining,
      durationMs: now() - start,
      error: errorMsg,
      requestId: requestId,
    });
  }
}
