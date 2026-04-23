import { ApiError } from "./types";

/**
 * Check if error should be logged (skip expected / client-handled statuses)
 * 400 - validation/input errors handled in UI
 * 401 - authentication
 * 404 - resource not found
 * 422 - validation / business rules (e.g. insufficient stock)
 */
export function shouldLogError(status: number): boolean {
  return status !== 400 && status !== 401 && status !== 404 && status !== 422;
}

/**
 * Check if error should be logged as warning (404 Not Found)
 */
export function shouldLogWarning(status: number): boolean {
  return status === 404;
}

/**
 * Parse error response from API
 */
export async function parseErrorResponse(response: Response): Promise<{
  errorText: string;
  errorData: unknown;
}> {
  let errorText = '';
  let errorData: unknown = null;
  
  try {
    const text = await response.text();
    errorText = text || '';
    
    // Try to parse as JSON
    if (errorText && errorText.trim().startsWith('{')) {
      try {
        errorData = JSON.parse(errorText);
      } catch {
        // If JSON parse fails, use text as is
      }
    }
  } catch {
    // If reading response fails, use empty values
  }
  
  return { errorText, errorData };
}

/**
 * Create API error from response
 */
export function createApiError(
  response: Response,
  errorText: string,
  errorData: unknown
): ApiError {
  const getReadableValue = (value: unknown): string => {
    if (typeof value === 'string') {
      return value.trim();
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    if (Array.isArray(value)) {
      const parts = value
        .map((item) => getReadableValue(item))
        .filter((item) => item.length > 0);
      return parts.join(', ');
    }
    if (value && typeof value === 'object') {
      try {
        const compact = JSON.stringify(value);
        return compact === '{}' ? '' : compact;
      } catch {
        return '';
      }
    }
    return '';
  };

  const errorObject = errorData && typeof errorData === 'object'
    ? (errorData as Record<string, unknown>)
    : null;

  const detailMessage = getReadableValue(errorObject?.detail);
  const messageMessage = getReadableValue(errorObject?.message);
  const errorsMessage = getReadableValue(errorObject?.errors);
  const fallbackText = errorText.trim();

  const errorMessage =
    detailMessage ||
    messageMessage ||
    errorsMessage ||
    fallbackText ||
    `API Error: ${response.status} ${response.statusText}`;
  
  return new ApiError(
    errorMessage,
    response.status,
    response.statusText || '',
    errorData
  );
}




