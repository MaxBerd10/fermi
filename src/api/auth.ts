import { apiClient, setTokens, clearTokens } from "./client";
import type { AuthUser } from "../types/content";
import type { LoginInput, RegisterInput } from "../types/forms";

interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

// Registration no longer signs the account straight in — the backend creates
// it inactive and emails a verification link (closing an open self-registration
// hole where anyone could mint an unlimited number of working accounts with no
// email ownership check at all). The account only starts working, and tokens
// are only issued, once verifyEmail() below succeeds.
export async function register(input: RegisterInput) {
  await apiClient.post<{ verificationRequired: true }>("auth/register", input);
}

export async function login(input: LoginInput) {
  const { data } = await apiClient.post<AuthResult>("auth/login", input);
  setTokens(data.accessToken, data.refreshToken);
  return data.user;
}

export async function logout() {
  try {
    await apiClient.post("auth/logout", undefined, true);
  } finally {
    clearTokens();
  }
}

export async function me() {
  const { data } = await apiClient.get<AuthUser>("auth/me", undefined, true);
  return data;
}

export async function requestPasswordReset(email: string) {
  await apiClient.post("auth/password-reset-request", { email });
}

export async function resetPassword(token: string, password: string) {
  await apiClient.post("auth/password-reset", { token, password });
}

export async function verifyEmail(token: string) {
  const { data } = await apiClient.post<AuthResult>("auth/verify-email", { token });
  setTokens(data.accessToken, data.refreshToken);
  return data.user;
}

export async function resendVerification(email: string) {
  await apiClient.post("auth/resend-verification", { email });
}
