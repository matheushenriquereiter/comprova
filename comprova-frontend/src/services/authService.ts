import { type User } from '../types/User';
import { apiClient } from './apiClient';

export interface CandidateProfile {
  username: string;
  email: string;
  cpf: string;
}

export interface UpdateCandidateProfileData {
  username: string;
  email: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface CompanyProfileData {
  username: string;
  email: string;
  legalName: string;
  tradeName: string;
  phone: string;
  cnpj: string;
}

export interface UpdateCompanyProfileData {
  legalName: string;
  tradeName: string;
  email: string;
  phone: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface ProfileUpdateResponse {
  username: string;
  email: string;
  token: string;
  message: string;
}

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
  },

  async getCandidateProfile(): Promise<CandidateProfile> {
    return await apiClient<CandidateProfile>('/candidate/profile', {
      method: 'GET'
    });
  },

  async updateCandidateProfile(data: UpdateCandidateProfileData): Promise<ProfileUpdateResponse> {
    const res = await apiClient<ProfileUpdateResponse>('/candidate/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    if (res?.token) {
      localStorage.setItem('token', res.token);
    }
    return res;
  },

  async getCompanyProfile(): Promise<CompanyProfileData> {
    return await apiClient<CompanyProfileData>('/company/profile', {
      method: 'GET'
    });
  },

  async updateCompanyProfile(data: UpdateCompanyProfileData): Promise<ProfileUpdateResponse> {
    const res = await apiClient<ProfileUpdateResponse>('/company/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    if (res?.token) {
      localStorage.setItem('token', res.token);
    }
    return res;
  }
};

