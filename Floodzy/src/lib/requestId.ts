export function getRequestId(headers: Headers) {
  return headers.get("x-request-id") || crypto.randomUUID();
}