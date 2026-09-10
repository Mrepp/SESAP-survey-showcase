import type { MiddlewareHandler } from 'hono';
import type { Env } from '../bindings';
import type { ApiResponse, AuthenticatedUser } from '@sesap/types';
import { AuthService } from '../services/auth-service';
import { renderAuthErrorPage } from '../templates/auth-error-page';
import { ACCESS_JWT_HEADER, AccessAuthError, verifyAccessJwt } from '../services/access-jwt';

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

  /**
   * The identity comes from the signed Access assertion, not from
   * `Cf-Access-Authenticated-User-Email`. That header is set by Access on the
   * way through, but nothing stops a client from setting it too — it is only
   * trustworthy if this worker can be reached exclusively via the Access
   * hostname, which is a deployment property rather than something the code can
   * check. The assertion is verified against the team's JWKS, so it holds
   * however the request arrived.
   */
  let userEmail: string;
  try {
    userEmail = await verifyAccessJwt(c.env, c.req.header(ACCESS_JWT_HEADER));
  } catch (error) {
    const authError =
      error instanceof AccessAuthError
        ? error
        : new AccessAuthError(
            'Could not verify your Cloudflare Access session.',
            'Verification failed unexpectedly.',
          );

    if (isHtmlRequest) {
      return c.html(renderAuthErrorPage(authError.message, authError.detail), 401);
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
      // `userEmail` now comes from a verified assertion rather than a header,
      // but it is still user-controlled text reaching an HTML template — the
      // template escapes both interpolations.
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
