export function now() { return Date.now(); }

export function logApi(event: {
  route: string;
  method: string;
  status: number;
  ip?: string;
  cache?: "HIT"|"MISS"|"BYPASS";
  rlRemaining?: number;
  durationMs: number;
  error?: string;
  requestId?: string;
}) {
  // gunakan console.log agar keluar di Vercel logs, bentuk JSON terstruktur
  console.log(JSON.stringify({ level:"info", ts:new Date().toISOString(), ...event }));
}