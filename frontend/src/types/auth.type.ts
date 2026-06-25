export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export type MeResponse = {
  user: AuthUser;
};

export type LoginResponse = {
  success?: boolean;
  user: AuthUser;
};

export type RegisterResponse = {
  success?: boolean;
  user: AuthUser;
};

export type ApiErrorResponse = {
  message?: string;
};
