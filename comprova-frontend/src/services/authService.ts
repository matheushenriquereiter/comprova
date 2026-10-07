import { type User } from '../types/User';

export const AuthService = {
  async signIn(email: string, password: string): Promise<string> {
    const response = await fetch('/api/auth/sign-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Credenciais inválidas ou erro no servidor.');
    }

    const data = await response.json();
    return data.token; // Returns the token
  },

  async getMe(token: string): Promise<User> {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw { status: response.status, message: 'Falha ao obter os dados do usuário.' };
    }

    return response.json();
  },

  async signUpCandidate(data: Record<string, unknown>): Promise<void> {
    const response = await fetch('/api/auth/sign-up/candidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw errorData; // We throw the object to handle field errors
    }
  },

  async signUpCompany(data: Record<string, unknown>): Promise<void> {
    const response = await fetch('/api/auth/sign-up/company', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw errorData; // We throw the object to handle field errors
    }
  }
};
