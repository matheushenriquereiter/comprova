package org.example.comprova.service;

import lombok.RequiredArgsConstructor;
import org.example.comprova.dto.CandidateResponseDTO;
import org.example.comprova.dto.CreateJobPostingDTO;
import org.example.comprova.dto.JobPostingResponseDTO;
import org.example.comprova.dto.SkillDTO;
import org.example.comprova.model.Company;
import org.example.comprova.model.JobPosting;
import org.example.comprova.repository.JobPostingRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class JobPostingService {
    private final JobPostingRepository jobPostingRepository;

    private static JobPostingResponseDTO mapJobPosting(JobPosting jobPosting) {
        return new JobPostingResponseDTO(
                jobPosting.getTitle(),
                jobPosting.getStatus(),
                jobPosting.getExpiresAt(),
                jobPosting.getCandidates().stream()
                        .map(candidate -> new CandidateResponseDTO(
                                candidate.getCandidate().getUsername(),
                                candidate.getCandidate().getEmail()))
                        .toList(),
                jobPosting.getSkills().stream()
                        .map(jobPostingSkill -> new SkillDTO(
                                jobPostingSkill.getSkill().getName()))
                        .toList()
        );
    }

    public void createJobPosting(Company company, CreateJobPostingDTO createJobPostingDTO) {
        JobPosting jobPosting = new JobPosting(createJobPostingDTO.title(), company, createJobPostingDTO.expiresAt());

        jobPostingRepository.save(jobPosting);
    }

    public Page<JobPostingResponseDTO> getJobPostings(Company company, Pageable pageable) {
        return jobPostingRepository
                .findAllByCompany(company, pageable)
                .map(JobPostingService::mapJobPosting);
    }

}
