package org.example.comprova.service;

import lombok.RequiredArgsConstructor;
import org.example.comprova.dto.*;
import org.example.comprova.enums.ApplicationStatus;
import org.example.comprova.enums.JobPostingStatus;
import org.example.comprova.exceptions.BusinessException;
import org.example.comprova.model.*;
import org.example.comprova.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JobPostingService {
    private final JobPostingRepository jobPostingRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final SkillRepository skillRepository;
    private final JobSkillRequirementRepository jobSkillRequirementRepository;
    private final AnswerRepository answerRepository;
    private final QuestionRepository questionRepository;
    private final AiEvaluationService aiEvaluationService;

    @Transactional
    public void createJobPosting(Company company, CreateJobPostingDTO createJobPostingDTO) {
        List<Question> questions = createJobPostingDTO.questions()
                .stream()
                .map(questionDTO -> new Question(
                        questionDTO.statement(),
                        questionDTO.type(),
                        questionDTO.skillEvaluated(),
                        questionDTO.estimatedTimeMinutes(),
                        questionDTO.expectedAnswer(),
                        questionDTO.codeSnippet(),
                        questionDTO.evaluationCriteria()
                ))
                .toList();

        JobPosting jobPosting = new JobPosting(
                createJobPostingDTO.title(),
                createJobPostingDTO.description(),
                createJobPostingDTO.workplaceType(),
                createJobPostingDTO.employmentType(),
                createJobPostingDTO.location(),
                company,
                createJobPostingDTO.expiresAt(),
                new HashSet<>(questions)
        );

        questions.forEach(q -> q.setJobPosting(jobPosting));
        jobPostingRepository.save(jobPosting);

        List<JobSkillRequirement> jobSkillRequirements = createJobPostingDTO.skills()
                .stream()
                .map(jobSkillRequirementDTO -> {
                    Skill skill = skillRepository.findByNameIgnoreCase(jobSkillRequirementDTO.name())
                            .orElseGet(() -> skillRepository.save(new Skill(jobSkillRequirementDTO.name())));

                    return new JobSkillRequirement(jobPosting, skill, jobSkillRequirementDTO.weight());
                })
                .toList();

        Integer weightSum = jobSkillRequirements.stream()
                .reduce(0, (accumulator, jobSkillRequirement) -> accumulator + jobSkillRequirement.getWeight(), Integer::sum);

        if (weightSum != 100) {
            throw new BusinessException(
                    HttpStatus.BAD_REQUEST,
                    String.format("The sum of skill weights must be exactly 100, but was %d.", weightSum)
            );
        }

        jobSkillRequirementRepository.saveAll(jobSkillRequirements);
    }

    @Transactional
    public void applyToJobPosting(Candidate candidate, Long jobPostingId) {
        JobPosting jobPosting = jobPostingRepository
                .findById(jobPostingId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Job posting not found."));

        if (jobApplicationRepository.existsByCandidateAndJobPosting(candidate, jobPosting)) {
            throw new BusinessException(HttpStatus.CONFLICT, "Candidate already applied for this application.");
        }

        JobApplication jobApplication = new JobApplication(candidate, jobPosting);
        jobPosting.addApplication(jobApplication);
        jobApplicationRepository.save(jobApplication);
    }

    @Transactional(readOnly = true)
    public JobPostingResponseDTO getJobPostingById(Company company, Long jobPostingId) {
        JobPosting jobPosting = jobPostingRepository.findById(jobPostingId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Job posting not found."));

        if (!jobPosting.getCompany().getId().equals(company.getId())) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "Job posting does not belong to the company.");
        }

        return mapJobPostingToResponseDTO(jobPosting);
    }

    @Transactional(readOnly = true)
    public Page<JobPostingResponseDTO> getCompanyJobPostings(Company company, Pageable pageable) {
        return jobPostingRepository
                .findAllByCompanyOrderByCreatedAtDesc(company, pageable)
                .map(JobPostingService::mapJobPostingToResponseDTO);
    }

    @Transactional(readOnly = true)
    public Page<CandidateApplicationDTO> getCandidateApplications(Candidate candidate, Pageable pageable) {
        return jobApplicationRepository
                .findAllByCandidateOrderByIdDesc(candidate, pageable)
                .map(app -> new CandidateApplicationDTO(
                        app.getId(),
                        app.getJobPosting().getId(),
                        app.getJobPosting().getTitle(),
                        app.getJobPosting().getCompany().getTradeName(),
                        app.getJobPosting().getEmploymentType(),
                        app.getJobPosting().getLocation(),
                        app.getStatus(),
                        app.getJobPosting().getStatus(),
                        app.getScore(),
                        app.getJobPosting().getWorkplaceType() != null ? app.getJobPosting().getWorkplaceType().name() : null,
                        app.getCreatedAt()
                ));
    }

    @Transactional(readOnly = true)
    public Page<CandidateJobApplicationResponseDTO> getAvailableJobPostings(Pageable pageable) {
        return jobPostingRepository
                .findAllByStatusOrderByCreatedAtDesc(JobPostingStatus.PUBLISHED, pageable)
                .map(JobPostingService::mapJobPostingToCandidateJobApplicationResponseDTO);
    }

    @Transactional(readOnly = true)
    public List<QuestionDTO> getApplicationTestQuestions(Long applicationId, Candidate candidate) {
        JobApplication app = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Application not found."));

        if (!app.getCandidate().getId().equals(candidate.getId())) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "Forbidden.");
        }

        return app.getJobPosting().getQuestions().stream().map(q -> new QuestionDTO(
                q.getStatement(),
                q.getType(),
                q.getSkillEvaluated(),
                q.getEstimatedTimeMinutes(),
                null,
                q.getCodeSnippet(),
                q.getEvaluationCriteria()
        )).toList();
    }

    @Transactional
    public Integer submitApplicationTest(Long applicationId, Candidate candidate, SubmitTestDTO submitTestDTO) {
        JobApplication app = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Application not found."));

        if (!app.getCandidate().getId().equals(candidate.getId())) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "Forbidden.");
        }

        app.setStatus(ApplicationStatus.EVALUATING);
        if (submitTestDTO.answers() != null) {
            submitTestDTO.answers().forEach((idx, text) -> {
                // Just pick the question by index from the list since the frontend sends it as idx
                java.util.List<Question> questions = app.getJobPosting().getQuestions().stream().toList();
                if (idx < questions.size()) {
                    Answer answer = new Answer(app, questions.get(idx.intValue()), text);
                    answerRepository.save(answer);
                }
            });
        }
        jobApplicationRepository.save(app);
        return aiEvaluationService.evaluateApplicationTestSync(app);
    }

    @Transactional
    public void updateJobPosting(Company company, Long jobPostingId, UpdateJobPostingDTO updateJobPostingDTO) {
        JobPosting jobPosting = jobPostingRepository
                .findById(jobPostingId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Job posting not found."));

        if (!jobPosting.getCompany().getId().equals(company.getId())) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "You do not have permission to update this job posting.");
        }

        jobPosting.setTitle(updateJobPostingDTO.title());
        jobPosting.setDescription(updateJobPostingDTO.description());
        jobPosting.setWorkplaceType(updateJobPostingDTO.workplaceType());
        jobPosting.setEmploymentType(updateJobPostingDTO.employmentType());
        jobPosting.setLocation(updateJobPostingDTO.location());
        jobPosting.setStatus(updateJobPostingDTO.status());

        jobPostingRepository.save(jobPosting);
    }

    @Transactional
    public void deleteJobPosting(Company company, Long jobPostingId) {
        JobPosting jobPosting = jobPostingRepository
                .findById(jobPostingId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Job posting not found."));

        if (!jobPosting.getCompany().getId().equals(company.getId())) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "You do not have permission to delete this job posting.");
        }

        jobPostingRepository.delete(jobPosting);
    }

    private static CandidateJobApplicationResponseDTO mapJobPostingToCandidateJobApplicationResponseDTO(JobPosting jobPosting) {
        return new CandidateJobApplicationResponseDTO(
                jobPosting.getId(),
                jobPosting.getTitle(),
                jobPosting.getCompany().getTradeName(),
                jobPosting.getDescription(),
                jobPosting.getEmploymentType(),
                jobPosting.getLocation(),
                jobPosting.getStatus(),
                jobPosting.getExpiresAt(),
                jobPosting.getWorkplaceType() != null ? jobPosting.getWorkplaceType().name() : null,
                jobPosting.getSkills().stream()
                        .map(JobPostingService::mapJobPostingSkillToResponseDTO)
                        .toList()
        );
    }

    private static JobPostingResponseDTO mapJobPostingToResponseDTO(JobPosting jobPosting) {
        return new JobPostingResponseDTO(
                jobPosting.getId(),
                jobPosting.getTitle(),
                jobPosting.getDescription(),
                jobPosting.getEmploymentType(),
                jobPosting.getLocation(),
                jobPosting.getStatus(),
                jobPosting.getExpiresAt(),
                jobPosting.getWorkplaceType(),
                jobPosting.getJobApplications().stream()
                        .map(JobPostingService::mapJobPostingCandidateToResponseDTO)
                        .toList(),
                jobPosting.getSkills().stream()
                        .map(JobPostingService::mapJobPostingSkillToResponseDTO)
                        .toList()
        );
    }

    private static JobSkillRequirementDTO mapJobPostingSkillToResponseDTO(JobSkillRequirement jobSkillRequirement) {
        return new JobSkillRequirementDTO(
                jobSkillRequirement.getSkill().getName(),
                jobSkillRequirement.getWeight()
        );
    }

    private static CandidateResponseDTO mapJobPostingCandidateToResponseDTO(JobApplication jobApplication) {
        return new CandidateResponseDTO(
                jobApplication.getCandidate().getUsername(),
                jobApplication.getCandidate().getEmail(),
                jobApplication.getScore(),
                jobApplication.getStatus() != null ? jobApplication.getStatus().name() : null
        );
    }
}
