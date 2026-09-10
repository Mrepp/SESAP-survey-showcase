import type { Env as HonoEnv, ErrorHandler } from 'hono';
import type { ApiResponse } from '@sesap/types';
import { SesapError, toHttpErrorStatus } from '@sesap/core';
import { Logger } from './logger';

export interface CreateErrorHandlerOptions {
  /** Worker name used in structured log lines, e.g. `sesap-admin`. */
  worker: string;
}

/**
 * Builds the Hono `onError` handler shared by every worker: `SesapError`s are
 * reported with their own code/status, anything else is logged and flattened to
 * a generic 500 so internals never leak to a client.
 */
export function createErrorHandler<E extends HonoEnv>({
  worker,
}: CreateErrorHandlerOptions): ErrorHandler<E> {
  const logger = new Logger({ worker, module: 'error-handler' });

  return (err, c) => {
    if (err instanceof SesapError) {
      logger.warn('Handled error', {
        code: err.code,
        message: err.message,
        statusCode: err.statusCode,
      });
      const response: ApiResponse<never> = {
        success: false,
        error: {
          code: err.code,
          message: err.message,
          details: err.details,
        },
      };
      return c.json(response, toHttpErrorStatus(err.statusCode));
    }

    logger.error('Unhandled error', { message: err.message, stack: err.stack });
    const response: ApiResponse<never> = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    };
    return c.json(response, 500);
  };
}
