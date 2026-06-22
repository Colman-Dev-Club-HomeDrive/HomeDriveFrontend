export type LoginRequest = {
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

export type LoginResponse = {
export type RegisterResponse = {
  success: boolean;
  token: string;
  user: AuthUser;
};

export type ApiErrorResponse = {
  message?: string;
};
