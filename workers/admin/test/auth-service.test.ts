import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../src/services/auth-service';
import type { AllowedUser } from '@sesap/types';

function createMockKVNamespace(): KVNamespace {
  const store = new Map<string, string>();
  return {
    get: vi.fn(async (key: string, type?: string) => {
      const value = store.get(key);
      if (!value) return null;
      if (type === 'json') return JSON.parse(value);
      return value;
    }),
    put: vi.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    delete: vi.fn(async (key: string) => {
      store.delete(key);
    }),
    list: vi.fn(),
    getWithMetadata: vi.fn(),
  } as unknown as KVNamespace;
}

describe('AuthService', () => {
  let kv: KVNamespace;
  let authService: AuthService;

  beforeEach(() => {
    kv = createMockKVNamespace();
    authService = new AuthService(kv);
  });

  describe('getAllowedUsers', () => {
    it('should return empty array when no users are stored', async () => {
      const users = await authService.getAllowedUsers();
      expect(users).toEqual([]);
    });

    it('should return stored users', async () => {
      const mockUsers: AllowedUser[] = [
        { email: 'user1@test.com', addedAt: '2024-01-01T00:00:00.000Z' },
        { email: 'user2@test.com', addedAt: '2024-01-02T00:00:00.000Z', addedBy: 'admin' },
      ];

      await kv.put('auth:allowed-emails', JSON.stringify(mockUsers));

      const users = await authService.getAllowedUsers();
      expect(users).toEqual(mockUsers);
    });
  });

  describe('isUserAllowed', () => {
    beforeEach(async () => {
      const mockUsers: AllowedUser[] = [
        { email: 'allowed@test.com', addedAt: '2024-01-01T00:00:00.000Z' },
        { email: 'Another@test.com', addedAt: '2024-01-02T00:00:00.000Z' },
      ];
      await kv.put('auth:allowed-emails', JSON.stringify(mockUsers));
    });

    it('should return true for allowed user', async () => {
      const isAllowed = await authService.isUserAllowed('allowed@test.com');
      expect(isAllowed).toBe(true);
    });

    it('should return true for allowed user (case insensitive)', async () => {
      const isAllowed = await authService.isUserAllowed('ALLOWED@TEST.COM');
      expect(isAllowed).toBe(true);
    });

    it('should return false for non-allowed user', async () => {
      const isAllowed = await authService.isUserAllowed('stranger@test.com');
      expect(isAllowed).toBe(false);
    });

    it('should return false when whitelist is empty', async () => {
      kv = createMockKVNamespace();
      authService = new AuthService(kv);

      const isAllowed = await authService.isUserAllowed('anyone@test.com');
      expect(isAllowed).toBe(false);
    });
  });

  describe('addUser', () => {
    it('should add a valid user to the whitelist', async () => {
      await authService.addUser('new@test.com', 'admin');

      const users = await authService.getAllowedUsers();
      expect(users).toHaveLength(1);
      expect(users[0].email).toBe('new@test.com');
      expect(users[0].addedBy).toBe('admin');
      expect(users[0].addedAt).toBeDefined();
    });

    it('should add user without addedBy field', async () => {
      await authService.addUser('new@test.com');

      const users = await authService.getAllowedUsers();
      expect(users).toHaveLength(1);
      expect(users[0].email).toBe('new@test.com');
      expect(users[0].addedBy).toBeUndefined();
    });

    it('should throw error for invalid email', async () => {
      await expect(authService.addUser('not-an-email')).rejects.toThrow();
    });

    it('should throw error when adding duplicate user', async () => {
      await authService.addUser('dup@test.com');
      await expect(authService.addUser('dup@test.com')).rejects.toThrow('User already in whitelist');
    });

    it('should throw error when adding duplicate user (case insensitive)', async () => {
      await authService.addUser('Dup@test.com');
      await expect(authService.addUser('dup@test.com')).rejects.toThrow('User already in whitelist');
    });
  });

  describe('removeUser', () => {
    beforeEach(async () => {
      const mockUsers: AllowedUser[] = [
        { email: 'user1@test.com', addedAt: '2024-01-01T00:00:00.000Z' },
        { email: 'user2@test.com', addedAt: '2024-01-02T00:00:00.000Z' },
        { email: 'user3@test.com', addedAt: '2024-01-03T00:00:00.000Z' },
      ];
      await kv.put('auth:allowed-emails', JSON.stringify(mockUsers));
    });

    it('should remove existing user and return true', async () => {
      const removed = await authService.removeUser('user2@test.com');
      expect(removed).toBe(true);

      const users = await authService.getAllowedUsers();
      expect(users).toHaveLength(2);
      expect(users.find((u) => u.email === 'user2@test.com')).toBeUndefined();
    });

    it('should remove user (case insensitive)', async () => {
      const removed = await authService.removeUser('USER2@TEST.COM');
      expect(removed).toBe(true);

      const users = await authService.getAllowedUsers();
      expect(users).toHaveLength(2);
    });

    it('should return false when removing non-existent user', async () => {
      const removed = await authService.removeUser('ghost@test.com');
      expect(removed).toBe(false);

      const users = await authService.getAllowedUsers();
      expect(users).toHaveLength(3);
    });

    it('should handle removing from empty whitelist', async () => {
      kv = createMockKVNamespace();
      authService = new AuthService(kv);

      const removed = await authService.removeUser('anyone@test.com');
      expect(removed).toBe(false);
    });
  });
});
