import type { AllowedUser } from '@sesap/types';
import { SesapError } from '@sesap/shared';

const ALLOWED_USERS_KEY = 'auth:allowed-emails';

export class AuthService {
  constructor(private kv: KVNamespace) {}

  async getAllowedUsers(): Promise<AllowedUser[]> {
    try {
      const data = await this.kv.get(ALLOWED_USERS_KEY, 'json');
      if (!data) {
        return [];
      }
      return data as AllowedUser[];
    } catch (error) {
      throw new SesapError('Failed to retrieve allowed users', 'STORAGE_ERROR', 500, { error });
    }
  }

  async isUserAllowed(email: string): Promise<boolean> {
    const allowedUsers = await this.getAllowedUsers();
    return allowedUsers.some((user) => user.email.toLowerCase() === email.toLowerCase());
  }

  async addUser(email: string, addedBy?: string): Promise<void> {
    if (!this.isValidEmail(email)) {
      throw new SesapError('Invalid email format', 'VALIDATION_ERROR', 400, { email });
    }

    const allowedUsers = await this.getAllowedUsers();

    if (allowedUsers.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
      throw new SesapError('User already in whitelist', 'VALIDATION_ERROR', 400, { email });
    }

    const newUser: AllowedUser = {
      email,
      addedAt: new Date().toISOString(),
      addedBy,
    };

    allowedUsers.push(newUser);

    try {
      await this.kv.put(ALLOWED_USERS_KEY, JSON.stringify(allowedUsers));
    } catch (error) {
      throw new SesapError('Failed to add user to whitelist', 'STORAGE_ERROR', 500, { email, error });
    }
  }

  async removeUser(email: string): Promise<boolean> {
    const allowedUsers = await this.getAllowedUsers();
    const initialLength = allowedUsers.length;

    const filteredUsers = allowedUsers.filter(
      (user) => user.email.toLowerCase() !== email.toLowerCase()
    );

    if (filteredUsers.length === initialLength) {
      return false;
    }

    try {
      await this.kv.put(ALLOWED_USERS_KEY, JSON.stringify(filteredUsers));
      return true;
    } catch (error) {
      throw new SesapError('Failed to remove user from whitelist', 'STORAGE_ERROR', 500, {
        email,
        error,
      });
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}