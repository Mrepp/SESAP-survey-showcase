export interface AuthenticatedUser {
  email: string;
  authenticatedAt: string;
}

export interface AllowedUser {
  email: string;
  addedAt: string;
  addedBy?: string;
}

export interface AllowedUsersListResponse {
  users: AllowedUser[];
  count: number;
}

export interface AddUserRequest {
  email: string;
}

export interface RemoveUserRequest {
  email: string;
}
