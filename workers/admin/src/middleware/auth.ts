import type { MiddlewareHandler } from 'hono';
import type { Env } from '../bindings';
import type { ApiResponse, AuthenticatedUser } from '@sesap/types';
import { AuthService } from '../services/auth-service';
import { renderAuthErrorPage } from '../templates/auth-error-page';

type Variables = {
  user: AuthenticatedUser;
};

export const authMiddleware: MiddlewareHandler<{ Bindings: Env; Variables: Variables }> = async (
  c,
  next
) => {
  // DEVELOPMENT BYPASS: Skip authentication in development environment
  if (c.env.ENVIRONMENT === 'development') {
    console.log('[AUTH] Development mode: Bypassing authentication');
    const devUser: AuthenticatedUser = {
      email: 'dev@localhost',
      authenticatedAt: new Date().toISOString(),
    };
    c.set('user', devUser);
    await next();
    return;
  }

  const acceptHeader = c.req.header('Accept') || '';
  const isHtmlRequest = acceptHeader.includes('text/html');

  const userEmail = c.req.header('Cf-Access-Authenticated-User-Email');
  if (!userEmail) {
    if (isHtmlRequest) {
      const html = renderAuthErrorPage(
        'This page requires authentication via Cloudflare Access.',
        'No Cloudflare Access email header found. Please ensure Cloudflare Access is configured.'
      );
      return c.html(html, 401);
    }

    const response: ApiResponse<never> = {
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Authentication required',
      },
    };
    return c.json(response, 401);
  }

  const authService = new AuthService(c.env.SESAP_KV);
  const isAllowed = await authService.isUserAllowed(userEmail);

  if (!isAllowed) {
    if (isHtmlRequest) {
      const html = renderAuthErrorPage(
        `Access Denied: Your email (${userEmail}) is not authorized.`,
        `Please contact an administrator to add your email to the whitelist.`
      );
      return c.html(html, 403);
    }

    const response: ApiResponse<never> = {
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Access denied. Your email is not authorized to access this resource.',
        details: { email: userEmail },
      },
    };
    return c.json(response, 403);
  }

  const authenticatedUser: AuthenticatedUser = {
    email: userEmail,
    authenticatedAt: new Date().toISOString(),
  };

  c.set('user', authenticatedUser);

  await next();
};
