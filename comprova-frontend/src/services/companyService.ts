import { apiClient } from './apiClient';

export interface CompanyProfile {
  legalName: string;
  tradeName: string;
  cnpj: string;
  email: string;
  phone: string;
}

export interface UpdateCompanyProfile {
  legalName: string;
  tradeName: string;
  email: string;
  phone: string;
  currentPassword?: string;
  newPassword?: string;
}

export const CompanyService = {
  async getProfile(): Promise<CompanyProfile> {
    return apiClient<CompanyProfile>('/company/profile', { method: 'GET' });
  },

  async updateProfile(data: UpdateCompanyProfile): Promise<CompanyProfile> {
    return apiClient<CompanyProfile>('/company/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
};
