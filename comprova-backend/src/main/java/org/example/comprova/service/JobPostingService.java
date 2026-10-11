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

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobPostingService {
    private final JobPostingRepository jobPostingRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final SkillRepository skillRepository;
    private final JobSkillRequirementRepository jobSkillRequirementRepository;
    private final AnswerRepository answerRepository;
    private final AiEvaluationService aiEvaluationService;

    @Transactional
    public void createJobPosting(Company company, CreateJobPostingDTO createJobPostingDTO) {
        // Valida os pesos ANTES de gravar qualquer coisa no banco.
        int weightSum = createJobPostingDTO.skills()
                .stream()
                .mapToInt(JobSkillRequirementDTO::weight)
                .sum();

        if (weightSum != 100) {
            throw new BusinessException(
                    HttpStatus.BAD_REQUEST,
                    String.format("The sum of skill weights must be exactly 100, but was %d.", weightSum)
            );
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
            throw new BusinessException(HttpStatus.CONFLICT, "This job posting is closed.");
        }

        if (jobPosting.getExpiresAt() != null && jobPosting.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BusinessException(HttpStatus.CONFLICT, "This job posting has expired.");
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
        // Só vagas publicadas e que ainda não expiraram.
        return jobPostingRepository
                .findAllByStatusAndExpiresAtAfterOrderByCreatedAtDesc(JobPostingStatus.PUBLISHED, LocalDateTime.now(), pageable)
                .map(JobPostingService::mapJobPostingToCandidateJobApplicationResponseDTO);
    }

    @Transactional(readOnly = true)
    public List<CandidateQuestionDTO> getApplicationTestQuestions(Long applicationId, Candidate candidate) {
        JobApplication app = findOwnedApplication(applicationId, candidate);

        if (app.getStatus() != ApplicationStatus.PENDING_TEST) {
            throw new BusinessException(HttpStatus.CONFLICT, "The test for this application has already been submitted.");
        }

        // Ordem fixa (por id) e o id de cada questão vai junto, para as respostas
        // voltarem ligadas à questão certa. A resposta esperada nunca é enviada.
        return app.getJobPosting().getQuestions().stream()
                .sorted(Comparator.comparing(Question::getId))
                .map(q -> new CandidateQuestionDTO(
                        q.getId(),
                        q.getStatement(),
                        q.getType(),
                        q.getSkillEvaluated(),
                        q.getEstimatedTimeMinutes(),
                        q.getCodeSnippet()
                ))
                .toList();
    }

    @Transactional
    public Integer submitApplicationTest(Long applicationId, Candidate candidate, SubmitTestDTO submitTestDTO) {
        JobApplication app = findOwnedApplication(applicationId, candidate);

        // Impede reenviar a prova para tentar uma nota maior.
        if (app.getStatus() != ApplicationStatus.PENDING_TEST) {
            throw new BusinessException(HttpStatus.CONFLICT, "The test for this application has already been submitted.");
        }

        app.setStatus(ApplicationStatus.EVALUATING);

        if (submitTestDTO != null && submitTestDTO.answers() != null) {
            // As respostas chegam como { idDaQuestao: texto }.
            Map<Long, Question> questionsById = app.getJobPosting().getQuestions().stream()
                    .collect(Collectors.toMap(Question::getId, Function.identity()));

            submitTestDTO.answers().forEach((questionId, text) -> {
                Question question = questionsById.get(questionId);
                if (question != null) {
                    answerRepository.save(new Answer(app, question, text));
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
        jobPosting.setExpiresAt(updateJobPostingDTO.expiresAt());

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

        // As respostas apontam para as candidaturas e para as questões da vaga.
        // Precisam sair primeiro, senão o banco recusa a exclusão (chave estrangeira).
        answerRepository.deleteByJobApplication_JobPosting(jobPosting);
        answerRepository.flush();

        jobPostingRepository.delete(jobPosting);
    }

    private JobApplication findOwnedApplication(Long applicationId, Candidate candidate) {
        JobApplication app = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Application not found."));

        if (!app.getCandidate().getId().equals(candidate.getId())) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "Forbidden.");
        }

        return app;
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
