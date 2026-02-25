interface FetchOptions extends RequestInit {
  maxRetries?: number;
  delayMs?: number;
  circuitBreakerThreshold?: number; // Number of consecutive failures to trip the circuit breaker
  circuitBreakerResetTimeMs?: number; // Time after which the circuit breaker attempts to close
}

let consecutiveFailures = 0;
let circuitBreakerTripped = false;
let circuitBreakerResetTimer: NodeJS.Timeout | null = null;

async function fetchWithRobustErrorHandling<T>(
  url: string,
  options?: FetchOptions,
): Promise<T> {
  const { maxRetries = 3, delayMs = 1000, circuitBreakerThreshold = 3, circuitBreakerResetTimeMs = 60000 } = options || {};

  if (circuitBreakerTripped) {
    throw new Error('Circuit breaker is open. Preventing further requests.');
  }

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'FloodzyApp/1.0 (devarahmat12334@gmail.com)', // Consistent User-Agent
          ...(options?.headers || {}),
        },
      });

      // Validate Content-Type
      const contentType = response.headers.get('Content-Type');
      if (!contentType || !contentType.includes('application/json')) {
        const textBody = await response.text();
        throw new Error(
          `[Fetch Error] Expected JSON, but received ${contentType || 'no content type'}. ` +
          `Status: ${response.status}, URL: ${url}, Body snippet: ${textBody.substring(0, 100)}...`
        );
      }

      if (!response.ok) {
        const errorBody = await response.text();
        const errorMessage = `[Fetch Error] Request failed with status ${response.status}. URL: ${url}, Body: ${errorBody.substring(0, 100)}...`;

        // Handle 429 (Too Many Requests) and 5xx errors with retry
        if (response.status === 429 || (response.status >= 500 && response.status < 600)) {
          console.warn(`${errorMessage}. Retrying... (${i + 1}/${maxRetries})`);
          consecutiveFailures++;
          if (consecutiveFailures >= circuitBreakerThreshold) {
            circuitBreakerTripped = true;
            console.error(`Circuit breaker tripped for ${url}. Opening for ${circuitBreakerResetTimeMs}ms.`);
            if (circuitBreakerResetTimer) clearTimeout(circuitBreakerResetTimer);
            circuitBreakerResetTimer = setTimeout(() => {
              circuitBreakerTripped = false;
              consecutiveFailures = 0;
              circuitBreakerResetTimer = null;
              console.log(`Circuit breaker reset for ${url}.`);
            }, circuitBreakerResetTimeMs);
          }
          if (i < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, i))); // Exponential backoff
            continue; // Retry
          }
        }
        throw new Error(errorMessage);
      }

      // Reset consecutive failures on success
      consecutiveFailures = 0;
      if (circuitBreakerResetTimer) clearTimeout(circuitBreakerResetTimer);
      circuitBreakerTripped = false;

      return response.json();
    } catch (error: any) {
      // If it's a network error (e.g., fetch failed), increment failures and retry
      if (error.name === 'TypeError' && error.message === 'fetch failed') {
        console.warn(`[Network Error] ${error.message}. Retrying... (${i + 1}/${maxRetries})`);
        consecutiveFailures++;
        if (consecutiveFailures >= circuitBreakerThreshold) {
          circuitBreakerTripped = true;
          console.error(`Circuit breaker tripped for ${url}. Opening for ${circuitBreakerResetTimeMs}ms.`);
          if (circuitBreakerResetTimer) clearTimeout(circuitBreakerResetTimer);
          circuitBreakerResetTimer = setTimeout(() => {
            circuitBreakerTripped = false;
            consecutiveFailures = 0;
            circuitBreakerResetTimer = null;
            console.log(`Circuit breaker reset for ${url}.`);
          }, circuitBreakerResetTimeMs);
        }
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, i))); // Exponential backoff
          continue; // Retry
        }
      }
      throw error; // Re-throw other errors immediately
    }
  }
  throw new Error(`Failed to fetch ${url} after ${maxRetries} attempts.`);
}

export { fetchWithRobustErrorHandling };
