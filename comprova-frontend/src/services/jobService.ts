export interface JobSkillRequirement {
  name: string;
  weight: number;
}


export interface CandidateResponseDTO {
  id: number;
  name: string;
  email: string;
}

export interface JobPostingResponseDTO {
  id: number;
  title: string;
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
  }
};
