export interface User {
  id: string; // UUID
  name: string;
  email: string;
  avatar?: string;
}

export interface Credential {
  id: string; // UUID
  name: string;
  type: 'password' | 'token';
  url?: string;
  description?: string;
  validity_date?: string;
  created_at: string;
}

export interface CredentialSecrets {
  username?: string;
  password?: string;
  token?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  needs_password: boolean;
  is_new: boolean;
}
