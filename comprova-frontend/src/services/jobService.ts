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
  workplaceType: string; // TRADITIONAL, REMOTE, HYBRID
  employmentType: string; // FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP
  location: string;
  expiresAt: string; // YYYY-MM-DDTHH:mm:ss
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
  async getCompanyJobPostingById(token: string, id: number): Promise<JobPostingResponseDTO> {
    const response = await fetch(`/api/company/job-postings/${id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error("Falha ao buscar vaga");
    return response.json();
  },

  async getCompanyJobPostings(token: string, page: number = 0, size: number = 20): Promise<Page<JobPostingResponseDTO>> {
    const response = await fetch(`/api/company/job-postings?page=${page}&size=${size}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw errorData || new Error("Falha ao buscar vagas.");
    }

    return response.json();
  },

  async getAvailableJobPostings(token: string, page: number = 0, size: number = 20): Promise<Page<JobPostingResponseDTO>> {
    const response = await fetch(`/api/candidate/available-job-postings?page=${page}&size=${size}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw errorData || new Error("Falha ao buscar vagas disponíveis.");
    }

    return response.json();
  },

  async getCandidateApplications(token: string, page: number = 0, size: number = 20): Promise<Page<JobPostingResponseDTO>> {
    const response = await fetch(`/api/candidate/job-postings?page=${page}&size=${size}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw errorData || new Error("Falha ao buscar suas candidaturas.");
    }

    return response.json();
  },

  async applyToJobPosting(token: string, jobPostingId: number): Promise<void> {
    const response = await fetch(`/api/candidate/job-postings/${jobPostingId}/applications`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw errorData || new Error("Falha ao se candidatar à vaga.");
    }
  },

  async createJobPosting(token: string, data: CreateJobPostingDTO): Promise<void> {
    const response = await fetch('/api/company/job-postings', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw errorData || new Error("Falha ao criar vaga.");
    }
  },

  async generateQuestions(token: string, description: string, skills: JobSkillRequirement[]): Promise<QuestionDTO[]> {
    const response = await fetch('/api/generate-questions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ description, skills })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw errorData || new Error("Falha ao gerar questões.");
    }

    return response.json();
  },

  async updateJobPosting(token: string, id: number, data: Partial<CreateJobPostingDTO> & { status?: string }): Promise<void> {
    const response = await fetch(`/api/company/job-postings/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw errorData || new Error("Falha ao atualizar vaga.");
    }
  },

  async deleteJobPosting(token: string, id: number): Promise<void> {
    const response = await fetch(`/api/company/job-postings/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw errorData || new Error("Falha ao deletar vaga.");
    }
  }
};
