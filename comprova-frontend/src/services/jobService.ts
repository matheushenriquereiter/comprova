import { apiClient } from './apiClient';

export interface JobSkillRequirement {
  name: string;
  weight: number;
}

export interface CandidateResponseDTO {
  username: string;
  email: string;
  score?: number;
  status?: string;
}

export interface JobPostingResponseDTO {
  id: number;
  title: string;
  description: string;
  employmentType: string;
  location: string;
  status: string;
  expiresAt: string;
  workplaceType: string;
  candidates: CandidateResponseDTO[];
  skills: JobSkillRequirement[];
}

export interface CandidateApplicationDTO {
  applicationId: number;
  jobPostingId: number;
  title: string;
  companyName: string;
  employmentType: string;
  location: string;
  status: string;
  jobPostingStatus: string;
  score?: number;
  workplaceType: string;
  createdAt: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface CreateJobPostingDTO {
  title: string;
  description: string;
  workplaceType: string;
  employmentType: string;
  location: string;
  expiresAt: string;
  skills: JobSkillRequirement[];
  questions: QuestionDTO[];
}

export interface QuestionDTO {
  statement: string;
  type: string;
  skillEvaluated: string;
  estimatedTimeMinutes: number;
  expectedAnswer: string;
  codeSnippet: string;
  evaluationCriteria: string[];
}

export const JobService = {
  async getCompanyJobPostingById(_token: string, id: number): Promise<JobPostingResponseDTO> {
    return apiClient<JobPostingResponseDTO>(`/company/job-postings/${id}`, { method: "GET" });
  },

  async getCompanyJobPostings(_token: string, page: number = 0, size: number = 20): Promise<Page<JobPostingResponseDTO>> {
    return apiClient<Page<JobPostingResponseDTO>>(`/company/job-postings?page=${page}&size=${size}`, { method: 'GET' });
  },

  async getAvailableJobPostings(_token: string, page: number = 0, size: number = 20): Promise<Page<JobPostingResponseDTO>> {
    return apiClient<Page<JobPostingResponseDTO>>(`/candidate/available-job-postings?page=${page}&size=${size}`, { method: 'GET' });
  },

  async getCandidateApplications(_token: string, page: number = 0, size: number = 20): Promise<Page<CandidateApplicationDTO>> {
    return apiClient<Page<CandidateApplicationDTO>>(`/candidate/job-postings?page=${page}&size=${size}`, { method: 'GET' });
  },

  async applyToJobPosting(_token: string, jobPostingId: number): Promise<void> {
    await apiClient(`/candidate/job-postings/${jobPostingId}/applications`, { method: 'POST' });
  },

  async createJobPosting(_token: string, data: CreateJobPostingDTO): Promise<void> {
    await apiClient('/company/job-postings', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async generateQuestions(_token: string, description: string, skills: JobSkillRequirement[]): Promise<QuestionDTO[]> {
    return apiClient<QuestionDTO[]>('/generate-questions', {
      method: 'POST',
      body: JSON.stringify({ description, skills })
    });
  },

  async updateJobPosting(_token: string, id: number, data: Partial<CreateJobPostingDTO> & { status?: string }): Promise<void> {
    await apiClient(`/company/job-postings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async getCandidateTestQuestions(_token: string, applicationId: number): Promise<QuestionDTO[]> {
    return apiClient<QuestionDTO[]>(`/candidate/applications/${applicationId}/test`, { method: 'GET' });
  },

  async submitCandidateTest(_token: string, applicationId: number, answers: Record<number, string>): Promise<{ score: number }> {
    return apiClient<{ score: number }>(`/candidate/applications/${applicationId}/test`, {
      method: 'POST',
      body: JSON.stringify({ answers })
    });
  },

  async deleteJobPosting(_token: string, id: number): Promise<void> {
    await apiClient(`/company/job-postings/${id}`, { method: 'DELETE' });
  }
};
