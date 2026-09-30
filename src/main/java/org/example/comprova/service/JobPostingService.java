package org.example.comprova.service;

import lombok.RequiredArgsConstructor;
import org.example.comprova.dto.CandidateResponseDTO;
import org.example.comprova.dto.CreateJobPostingDTO;
import org.example.comprova.dto.JobPostingResponseDTO;
import org.example.comprova.dto.JobPostingSkillDTO;
import org.example.comprova.exceptions.BusinessException;
import org.example.comprova.model.*;
import org.example.comprova.repository.JobPostingRepository;
import org.example.comprova.repository.JobPostingSkillRepository;
import org.example.comprova.repository.SkillRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JobPostingService {
    private final JobPostingRepository jobPostingRepository;
    private final SkillRepository skillRepository;
    private final JobPostingSkillRepository jobPostingSkillRepository;

    public void createJobPosting(Company company, CreateJobPostingDTO createJobPostingDTO) {
        JobPosting jobPosting = new JobPosting(
                createJobPostingDTO.title(),
                createJobPostingDTO.description(),
                createJobPostingDTO.workplaceType(),
                createJobPostingDTO.employmentType(),
                createJobPostingDTO.location(),
                company,
                createJobPostingDTO.expiresAt()
        );

        jobPostingRepository.save(jobPosting);

        List<JobPostingSkill> jobPostingSkills = createJobPostingDTO.skills()
                .stream()
                .map(jobPostingSkillDTO -> {
                    Skill skill = skillRepository.findByNameIgnoreCase(jobPostingSkillDTO.name())
                            .orElseGet(() -> skillRepository.save(new Skill(jobPostingSkillDTO.name())));

                    return new JobPostingSkill(jobPosting, skill, jobPostingSkillDTO.weight());
                })
                .toList();

        Integer weightSum = jobPostingSkills.stream()
                .reduce(0, (accumulator, jobPostingSkill) -> accumulator + jobPostingSkill.getWeight(), Integer::sum);

        if (weightSum != 100) {
            throw new BusinessException(
                    HttpStatus.BAD_REQUEST,
                    String.format("The sum of skill weights must be exactly 100, but was %d.", weightSum)
            );
        }

        jobPostingSkillRepository.saveAll(jobPostingSkills);
    }

    public Page<JobPostingResponseDTO> getJobPostings(Company company, Pageable pageable) {
        return jobPostingRepository
                .findAllByCompanyOrderByCreatedAtDesc(company, pageable)
                .map(JobPostingService::mapJobPostingToResponseDTO);
    }

    private static JobPostingResponseDTO mapJobPostingToResponseDTO(JobPosting jobPosting) {
        return new JobPostingResponseDTO(
                jobPosting.getId(),
                jobPosting.getTitle(),
                jobPosting.getStatus(),
                jobPosting.getExpiresAt(),

                jobPosting.getCandidates()
                        .stream()
                        .map(JobPostingService::mapJobPostingCandidateToResponseDTO)
                        .toList(),

                jobPosting.getSkills().stream()
                        .map(JobPostingService::mapJobPostingSkillToResponseDTO)
                        .toList()
        );
    }

    private static JobPostingSkillDTO mapJobPostingSkillToResponseDTO(JobPostingSkill jobPostingSkill) {
        return new JobPostingSkillDTO(
                jobPostingSkill.getSkill().getName(),
                jobPostingSkill.getWeight()
        );
    }

    private static CandidateResponseDTO mapJobPostingCandidateToResponseDTO(JobPostingCandidate jobPostingCandidate) {
        return new CandidateResponseDTO(
                jobPostingCandidate.getCandidate().getUsername(),
                jobPostingCandidate.getCandidate().getEmail()
        );
    }
}
