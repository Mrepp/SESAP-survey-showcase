import { Hono } from 'hono';
import type { Env } from '../bindings';
import type {
  ApiResponse,
  AllowedUsersListResponse,
  AddUserRequest,
  AuthenticatedUser,
} from '@sesap/types';
import { AuthService } from '../services/auth-service';

const auth = new Hono<{ Bindings: Env; Variables: { user: AuthenticatedUser } }>();

auth.get('/me', (c) => {
  const user = c.get('user');

  const response: ApiResponse<AuthenticatedUser> = {
    success: true,
    data: user,
  };

  return c.json(response);
});

auth.get('/allowed-users', async (c) => {
  const authService = new AuthService(c.env.SESAP_KV);
  const users = await authService.getAllowedUsers();

  const responseData: AllowedUsersListResponse = {
    users,
    count: users.length,
  };

  const response: ApiResponse<AllowedUsersListResponse> = {
    success: true,
    data: responseData,
  };

  return c.json(response);
});

auth.post('/allowed-users', async (c) => {
  const body = await c.req.json<AddUserRequest>();
  const currentUser = c.get('user');

  if (!body.email) {
    const response: ApiResponse<never> = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Email is required',
      },
    };
    return c.json(response, 400);
  }

  const authService = new AuthService(c.env.SESAP_KV);
  await authService.addUser(body.email, currentUser.email);

  const response: ApiResponse<{ email: string }> = {
    success: true,
    data: { email: body.email },
  };

  return c.json(response, 201);
});

auth.delete('/allowed-users/:email', async (c) => {
  const email = c.req.param('email');

  if (!email) {
    const response: ApiResponse<never> = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Email is required',
      },
    };
    return c.json(response, 400);
  }

  const authService = new AuthService(c.env.SESAP_KV);
  const removed = await authService.removeUser(email);

  if (!removed) {
    const response: ApiResponse<never> = {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'User not found in whitelist',
      },
    };
    return c.json(response, 404);
  }

  const response: ApiResponse<{ email: string }> = {
    success: true,
    data: { email },
  };

  return c.json(response);
});

export default auth;
