package org.example.comprova.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.comprova.dto.CandidateJobApplicationResponseDTO;
import org.example.comprova.dto.CreateJobPostingDTO;
import org.example.comprova.dto.JobPostingResponseDTO;
import org.example.comprova.model.Candidate;
import org.example.comprova.model.Company;
import org.example.comprova.service.JobPostingService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class JobPostingController {
    private final JobPostingService jobPostingService;

    @PostMapping("/company/job-postings")
    public ResponseEntity<Void> createJobPosting(@AuthenticationPrincipal Company company, @Valid @RequestBody CreateJobPostingDTO createJobPostingDTO) {
        jobPostingService.createJobPosting(company, createJobPostingDTO);

        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/company/job-postings")
    public ResponseEntity<Page<JobPostingResponseDTO>> getCompanyJobPostings(@AuthenticationPrincipal Company company, Pageable pageable) {
        Page<JobPostingResponseDTO> jobPostings = jobPostingService.getCompanyJobPostings(company, pageable);

        return ResponseEntity.ok(jobPostings);
    }

    @PostMapping("/candidate/job-postings/{jobPostingId}/applications")
    public ResponseEntity<Void> applyToJobPosting(
            @AuthenticationPrincipal Candidate candidate,
            @PathVariable("jobPostingId") Long jobPostingId
    ) {
        jobPostingService.applyToJobPosting(candidate, jobPostingId);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/candidate/job-postings")
    public ResponseEntity<Page<CandidateJobApplicationResponseDTO>> getCandidateApplications(@AuthenticationPrincipal Candidate candidate, Pageable pageable) {
        Page<CandidateJobApplicationResponseDTO> candidateApplications = jobPostingService.getCandidateApplications(candidate, pageable);

        return ResponseEntity.ok(candidateApplications);
    }
}
