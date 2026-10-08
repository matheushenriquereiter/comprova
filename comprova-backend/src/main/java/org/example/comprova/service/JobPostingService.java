package org.example.comprova.service;

import lombok.RequiredArgsConstructor;
import org.example.comprova.dto.*;
import org.example.comprova.exceptions.BusinessException;
import org.example.comprova.model.*;
import org.example.comprova.repository.JobApplicationRepository;
import org.example.comprova.repository.JobPostingRepository;
import org.example.comprova.repository.JobSkillRequirementRepository;
import org.example.comprova.repository.SkillRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JobPostingService {
    private final JobPostingRepository jobPostingRepository;
    private final SkillRepository skillRepository;
    private final JobSkillRequirementRepository jobSkillRequirementRepository;
    private final JobApplicationRepository jobApplicationRepository;

    public Question questionDTOToEntity(QuestionDTO questionDTO) {
        return new Question(
                questionDTO.statement(),
                questionDTO.type(),
                questionDTO.skillEvaluated(),
                questionDTO.estimatedTimeMinutes(),
                questionDTO.expectedAnswer(),
                questionDTO.codeSnippet(),
                questionDTO.evaluationCriteria()
        );
    }

    @Transactional
    public void createJobPosting(Company company, CreateJobPostingDTO createJobPostingDTO) {
        List<Question> questions = createJobPostingDTO
                .questions()
                .stream()
                .map(this::questionDTOToEntity)
                .toList();

        JobPosting jobPosting = new JobPosting(
                createJobPostingDTO.title(),
                createJobPostingDTO.description(),
                createJobPostingDTO.workplaceType(),
                createJobPostingDTO.employmentType(),
                createJobPostingDTO.location(),
                company,
                createJobPostingDTO.expiresAt(),
                new java.util.HashSet<>(questions)
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
    public Page<JobPostingResponseDTO> getCompanyJobPostings(Company company, Pageable pageable) {
        return jobPostingRepository
                .findAllByCompanyOrderByCreatedAtDesc(company, pageable)
                .map(JobPostingService::mapJobPostingToResponseDTO);
    }

    @Transactional(readOnly = true)
    public Page<CandidateJobApplicationResponseDTO> getCandidateApplications(Candidate candidate, Pageable pageable) {
        return jobPostingRepository
                .findAllByJobApplications_CandidateOrderByCreatedAtDesc(candidate, pageable)
                .map(JobPostingService::mapJobPostingToCandidateJobApplicationResponseDTO);
    }

    private static CandidateJobApplicationResponseDTO mapJobPostingToCandidateJobApplicationResponseDTO(JobPosting jobPosting) {
        return new CandidateJobApplicationResponseDTO(
                jobPosting.getId(),
                jobPosting.getTitle(),
                jobPosting.getDescription(),
                jobPosting.getEmploymentType(),
                jobPosting.getLocation(),
                jobPosting.getStatus(),
                jobPosting.getExpiresAt(),
                jobPosting.getWorkplaceType().name(),

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

                jobPosting.getJobApplications()
                        .stream()
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
                jobApplication.getCandidate().getEmail()
        );
    }
}
