export interface JobSkillRequirement {
  name: string;
  weight: number;
}

export interface CreateJobPostingDTO {
  title: string;
  description: string;
  workplaceType: string; // TRADITIONAL, REMOTE, HYBRID
  employmentType: string; // FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP
  location: string;
  expiresAt: string; // YYYY-MM-DDTHH:mm:ss
  skills: JobSkillRequirement[];
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
      throw errorData || new Error("Failed to create job posting.");
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
      throw errorData || new Error("Failed to generate questions.");
    }

    return response.json();
  }
};
