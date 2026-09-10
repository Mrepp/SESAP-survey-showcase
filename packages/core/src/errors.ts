export class SesapError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'SesapError';
  }
}

export class NotFoundError extends SesapError {
  constructor(resource: string, id: string) {
    super(`${resource} not found: ${id}`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends SesapError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class ProcessingError extends SesapError {
  constructor(message: string, details?: unknown) {
    super(message, 'PROCESSING_ERROR', 500, details);
    this.name = 'ProcessingError';
  }
}

export class AuthenticationError extends SesapError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

/**
 * HTTP statuses a `SesapError` is allowed to surface. Hono's `c.json()` needs a
 * literal status union, and `SesapError.statusCode` is a plain `number`, so the
 * error handler narrows through this list rather than casting blindly — an
 * unlisted status falls back to 500 instead of being smuggled through.
 */
export const HTTP_ERROR_STATUSES = [400, 401, 403, 404, 409, 413, 422, 429, 500, 503] as const;

export type HttpErrorStatus = (typeof HTTP_ERROR_STATUSES)[number];

export function toHttpErrorStatus(statusCode: number): HttpErrorStatus {
  return (HTTP_ERROR_STATUSES as readonly number[]).includes(statusCode)
    ? (statusCode as HttpErrorStatus)
    : 500;
}
