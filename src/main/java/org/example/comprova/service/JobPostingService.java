package org.example.comprova.service;

import lombok.RequiredArgsConstructor;
import org.example.comprova.dto.CandidateResponseDTO;
import org.example.comprova.dto.CreateJobPostingDTO;
import org.example.comprova.dto.JobPostingResponseDTO;
import org.example.comprova.dto.SkillDTO;
import org.example.comprova.model.Company;
import org.example.comprova.model.JobPosting;
import org.example.comprova.model.JobPostingSkill;
import org.example.comprova.model.Skill;
import org.example.comprova.repository.JobPostingRepository;
import org.example.comprova.repository.JobPostingSkillRepository;
import org.example.comprova.repository.SkillRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JobPostingService {
    private final JobPostingRepository jobPostingRepository;
    private final SkillRepository skillRepository;
    private final JobPostingSkillRepository jobPostingSkillRepository;

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

        List<JobPostingSkill> jobPostingSkills = createJobPostingDTO.skills().stream()
                .map(jobPostingSkillDTO -> {
                    Skill skill = skillRepository.findByNameIgnoreCase(jobPostingSkillDTO.name())
                            .orElse(skillRepository.save(new Skill(jobPostingSkillDTO.name())));

                    return jobPostingSkillRepository.save(new JobPostingSkill(jobPosting, skill, jobPostingSkillDTO.weight()));
                }).toList();

        jobPostingSkills.forEach(jobPosting::addSkill);
    }

    public Page<JobPostingResponseDTO> getJobPostings(Company company, Pageable pageable) {
        return jobPostingRepository
                .findAllByCompany(company, pageable)
                .map(JobPostingService::mapJobPosting);
    }
}
