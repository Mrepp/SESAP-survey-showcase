import type { ErrorHandler } from 'hono';
import type { Env } from '../bindings';
import type { ApiResponse, AuthenticatedUser } from '@sesap/types';
import { SesapError, Logger } from '@sesap/shared';

const logger = new Logger({ worker: 'sesap-admin', module: 'error-handler' });

type Variables = {
  user: AuthenticatedUser;
};

export const errorHandler: ErrorHandler<{ Bindings: Env; Variables: Variables }> = (err, c) => {
  if (err instanceof SesapError) {
    logger.warn('Handled error', { code: err.code, message: err.message, statusCode: err.statusCode });
    const response: ApiResponse<never> = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    };
    return c.json(response, err.statusCode as 400 | 401 | 404 | 500);
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
