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
    private final org.springframework.transaction.support.TransactionTemplate transactionTemplate;

    @Transactional
    public void createJobPosting(Company company, CreateJobPostingDTO createJobPostingDTO) {
        int weightSum = createJobPostingDTO.skills().stream()
                .mapToInt(JobSkillRequirementDTO::weight)
                .sum();

        if (weightSum != 100) {
            throw new BusinessException(
                    HttpStatus.BAD_REQUEST,
                    String.format("The sum of skill weights must be exactly 100, but was %d.", weightSum)
            );
        }

        long distinctSkills = createJobPostingDTO.skills().stream()
                .map(skill -> skill.name().toLowerCase(java.util.Locale.ROOT))
                .distinct()
                .count();

        if (distinctSkills != createJobPostingDTO.skills().size()) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "Skills must not contain duplicated names.");
        }

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

        jobSkillRequirementRepository.saveAll(jobSkillRequirements);
    }

    @Transactional
    public void applyToJobPosting(Candidate candidate, Long jobPostingId) {
        JobPosting jobPosting = jobPostingRepository
                .findById(jobPostingId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Job posting not found."));

        if (jobPosting.getStatus() != JobPostingStatus.PUBLISHED) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "Job posting is not open for applications.");
        }

        if (jobPosting.getExpiresAt() != null && jobPosting.getExpiresAt().isBefore(java.time.LocalDateTime.now())) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "Job posting has expired.");
        }

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
    public List<CandidateQuestionDTO> getApplicationTestQuestions(Long applicationId, Candidate candidate) {
        JobApplication app = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Application not found."));

        if (!app.getCandidate().getId().equals(candidate.getId())) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "Forbidden.");
        }

        if (app.getStatus() != ApplicationStatus.PENDING_TEST) {
            throw new BusinessException(HttpStatus.CONFLICT, "Test has already been submitted.");
        }

        return app.getJobPosting().getQuestions().stream()
                .sorted(java.util.Comparator.comparing(Question::getId, java.util.Comparator.nullsLast(java.util.Comparator.naturalOrder())))
                .map(q -> new CandidateQuestionDTO(
                        q.getId(),
                        q.getStatement(),
                        q.getType(),
                        q.getSkillEvaluated(),
                        q.getEstimatedTimeMinutes(),
                        q.getCodeSnippet()
                )).toList();
    }

    public Integer submitApplicationTest(Long applicationId, Candidate candidate, SubmitTestDTO submitTestDTO) {
        JobApplication app = transactionTemplate.execute(status -> {
            JobApplication application = jobApplicationRepository.findById(applicationId)
                    .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Application not found."));

            if (!application.getCandidate().getId().equals(candidate.getId())) {
                throw new BusinessException(HttpStatus.FORBIDDEN, "Forbidden.");
            }

            if (application.getStatus() != ApplicationStatus.PENDING_TEST) {
                throw new BusinessException(HttpStatus.CONFLICT, "Test has already been submitted.");
            }

            if (application.getJobPosting().getStatus() == JobPostingStatus.CLOSED) {
                throw new BusinessException(HttpStatus.BAD_REQUEST, "Job posting is closed.");
            }

            application.setStatus(ApplicationStatus.EVALUATING);
            jobApplicationRepository.saveAndFlush(application);

            // Delete any existing answers for this application to avoid duplicates
            List<Answer> existingAnswers = answerRepository.findAllByJobApplication(application);
            if (!existingAnswers.isEmpty()) {
                answerRepository.deleteAll(existingAnswers);
                answerRepository.flush();
            }

            List<Question> questions = application.getJobPosting().getQuestions().stream()
                    .sorted(java.util.Comparator.comparing(Question::getId, java.util.Comparator.nullsLast(java.util.Comparator.naturalOrder())))
                    .toList();

            if (application.getJobPosting().getSkills() != null) {
                application.getJobPosting().getSkills().size();
            }

            // Ensure an Answer is saved for EVERY question in the test
            for (int i = 0; i < questions.size(); i++) {
                Question question = questions.get(i);
                String responseText = "";
                if (submitTestDTO != null && submitTestDTO.answers() != null) {
                    String text = submitTestDTO.answers().get((long) i);
                    if (text == null && question.getId() != null) {
                        text = submitTestDTO.answers().get(question.getId());
                    }
                    if (text != null) {
                        responseText = text.trim();
                    }
                }
                Answer answer = new Answer(application, question, responseText);
                answerRepository.save(answer);
            }
            answerRepository.flush();

            return application;
        });

        if (app == null) {
            throw new BusinessException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to process test submission.");
        }

        try {
            return aiEvaluationService.evaluateApplicationTestSync(app);
        } catch (Exception e) {
            transactionTemplate.executeWithoutResult(status ->
                    jobApplicationRepository.findById(applicationId).ifPresent(application -> {
                        if (application.getStatus() == ApplicationStatus.EVALUATING) {
                            application.setStatus(ApplicationStatus.PENDING_TEST);
                            jobApplicationRepository.saveAndFlush(application);
                        }
                    })
            );
            throw e;
        }
    }

    @Transactional
    public void updateJobPosting(Company company, Long jobPostingId, UpdateJobPostingDTO updateJobPostingDTO) {
        JobPosting jobPosting = jobPostingRepository
                .findById(jobPostingId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Job posting not found."));

        if (!jobPosting.getCompany().getId().equals(company.getId())) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "You do not have permission to update this job posting.");
        }

        boolean isReopening = updateJobPostingDTO.status() == JobPostingStatus.PUBLISHED
                && jobPosting.getStatus() != JobPostingStatus.PUBLISHED;
        if (isReopening && jobPosting.getExpiresAt() != null
                && jobPosting.getExpiresAt().isBefore(java.time.LocalDateTime.now())) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "An expired job posting cannot be published again.");
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

        if (jobPosting.getJobApplications() != null) {
            for (JobApplication app : jobPosting.getJobApplications()) {
                List<Answer> answers = answerRepository.findAllByJobApplication(app);
                if (!answers.isEmpty()) {
                    answerRepository.deleteAll(answers);
                }
            }
            answerRepository.flush();
        }

        jobPostingRepository.delete(jobPosting);
    }

    @Transactional
    public void updateApplicationStatus(Company company, Long applicationId, UpdateApplicationStatusDTO dto) {
        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Candidatura não encontrada."));

        if (!application.getJobPosting().getCompany().getId().equals(company.getId())) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "Você não tem permissão para alterar esta candidatura.");
        }

        if (application.getStatus() == ApplicationStatus.PENDING_TEST || application.getStatus() == ApplicationStatus.EVALUATING) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "O candidato ainda não concluiu a avaliação técnica.");
        }

        if (dto.status() != ApplicationStatus.PASSED && dto.status() != ApplicationStatus.FAILED) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "O status só pode ser definido como PASSED (Aprovado) ou FAILED (Reprovado).");
        }

        application.setStatus(dto.status());
        jobApplicationRepository.save(application);
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
                jobApplication.getId(),
                jobApplication.getCandidate().getUsername(),
                jobApplication.getCandidate().getEmail(),
                jobApplication.getScore(),
                jobApplication.getStatus() != null ? jobApplication.getStatus().name() : null
        );
    }
}
