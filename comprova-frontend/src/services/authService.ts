import { type User } from '../types/User';
import { apiClient } from './apiClient';

export const AuthService = {
  async signIn(email: string, password: string): Promise<string> {
    try {
      const data = await apiClient<{ token: string }>('/auth/sign-in', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      return data.token;
    } catch (err: unknown) {
      const error = err as { message?: string };
      throw new Error(error?.message || 'Credenciais inválidas ou erro no servidor.');
    }
  },

  async getMe(_token?: string): Promise<User> {
    try {
      return await apiClient<User>('/auth/me', {
        method: 'GET'
      });
    } catch (err: unknown) {
      const error = err as { status?: number };
      throw { status: error?.status || 401, message: 'Falha ao obter os dados do usuário.' };
    }
  },

  async signUpCandidate(data: Record<string, unknown>): Promise<void> {
    await apiClient('/auth/sign-up/candidate', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async signUpCompany(data: Record<string, unknown>): Promise<void> {
    await apiClient('/auth/sign-up/company', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};
