// lib/error-utils.ts

export class UserFriendlyError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'UserFriendlyError';
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, UserFriendlyError.prototype);
  }
}

export async function safeFetch<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
  userMessage: string = 'Terjadi kesalahan saat mengambil data. Silakan coba lagi.',
): Promise<T> {
  try {
    const response = await fetch(input, init);

    if (!response.ok) {
      let errorDetail = `HTTP error! status: ${response.status}`;

      // Handle Gateway Timeout specifically
      if (response.status === 504) {
        errorDetail = "Gateway Timeout (504): Server sedang sibuk, silakan coba lagi nanti.";
        throw new UserFriendlyError("Server sedang sibuk (Timeout), silakan coba beberapa saat lagi.", new Error(errorDetail));
      }

      try {
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          // Try to extract useful message from common error formats
          errorDetail = errorData.message || errorData.error || (typeof errorData === 'string' ? errorData : JSON.stringify(errorData));
        } catch {
          // If JSON parse fails, use the raw text if available
          if (text && text.trim().length > 0) {
            errorDetail = text.substring(0, 200) + (text.length > 200 ? '...' : ''); // Truncate long HTML errors
          }
        }
      } catch (e) {
        console.warn("Retrieved empty or unreadable error response body");
      }

      console.error(`API Error (${input}): ${errorDetail}`);
      throw new UserFriendlyError(userMessage, new Error(errorDetail));
    }

    return response.json() as Promise<T>;
  } catch (error: any) {
    if (error instanceof UserFriendlyError) {
      throw error; // Re-throw user-friendly errors directly
    }
    // Handle specific network errors
    if (error.name === 'AbortError') {
      throw new UserFriendlyError("Permintaan dibatalkan (Timeout).", error);
    }
    console.error(`Network or unexpected error (${input}): ${error.message}`);
    throw new UserFriendlyError(userMessage, error);
  }
}
