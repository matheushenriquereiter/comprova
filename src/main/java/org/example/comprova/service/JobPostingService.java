package org.example.comprova.service;

import lombok.RequiredArgsConstructor;
import org.example.comprova.dto.CreateJobPostingDTO;
import org.example.comprova.dto.JobPostingResponseDTO;
import org.example.comprova.model.Company;
import org.example.comprova.model.JobPosting;
import org.example.comprova.repository.JobPostingRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JobPostingService {
    private final JobPostingRepository jobPostingRepository;

    public void createJobPosting(Company company, CreateJobPostingDTO createJobPostingDTO) {
        JobPosting jobPosting = new JobPosting(createJobPostingDTO.title(), company, createJobPostingDTO.expiresAt());

        jobPostingRepository.save(jobPosting);
    }

    public List<JobPostingResponseDTO> getJobPostings(Company company) {
        return jobPostingRepository
                .findAllByCompany(company)
                .stream()
                .map(jobPosting -> new JobPostingResponseDTO(jobPosting.getTitle(), jobPosting.getStatus(), jobPosting.getExpiresAt()))
                .toList();
    }
}
