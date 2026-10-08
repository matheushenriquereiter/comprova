package org.example.comprova.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.comprova.dto.CandidateJobApplicationResponseDTO;
import org.example.comprova.dto.CandidateApplicationDTO;
import org.example.comprova.dto.CreateJobPostingDTO;
import org.example.comprova.dto.JobPostingResponseDTO;
import org.example.comprova.dto.QuestionDTO;
import org.example.comprova.dto.UpdateJobPostingDTO;
import org.example.comprova.model.Candidate;
import org.example.comprova.model.Company;
import org.example.comprova.service.JobPostingService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class JobPostingController {
    private final JobPostingService jobPostingService;

    @PostMapping("/company/job-postings")
    public ResponseEntity<Void> createJobPosting(@AuthenticationPrincipal Company company, @Valid @RequestBody CreateJobPostingDTO createJobPostingDTO) {
        jobPostingService.createJobPosting(company, createJobPostingDTO);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/company/job-postings/{jobPostingId}")
    public ResponseEntity<JobPostingResponseDTO> getCompanyJobPosting(
            @AuthenticationPrincipal Company company,
            @PathVariable Long jobPostingId
    ) {
        JobPostingResponseDTO jobPosting = jobPostingService.getJobPostingById(company, jobPostingId);
        return ResponseEntity.ok(jobPosting);
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
    public ResponseEntity<Page<CandidateApplicationDTO>> getCandidateApplications(@AuthenticationPrincipal Candidate candidate, Pageable pageable) {
        Page<CandidateApplicationDTO> candidateApplications = jobPostingService.getCandidateApplications(candidate, pageable);
        return ResponseEntity.ok(candidateApplications);
    }

    @GetMapping("/candidate/applications/{applicationId}/test")
    public ResponseEntity<List<QuestionDTO>> getTestQuestions(
            @AuthenticationPrincipal Candidate candidate,
            @PathVariable Long applicationId) {
        return ResponseEntity.ok(jobPostingService.getApplicationTestQuestions(applicationId, candidate));
    }

    @PostMapping("/candidate/applications/{applicationId}/test")
    public ResponseEntity<java.util.Map<String, Integer>> submitTest(
            @RequestBody org.example.comprova.dto.SubmitTestDTO submitTestDTO,
            @AuthenticationPrincipal Candidate candidate,
            @PathVariable Long applicationId) {
        Integer score = jobPostingService.submitApplicationTest(applicationId, candidate, submitTestDTO);
        return ResponseEntity.ok(java.util.Map.of("score", score));
    }

    @GetMapping("/candidate/available-job-postings")
    public ResponseEntity<Page<CandidateJobApplicationResponseDTO>> getAvailableJobPostings(Pageable pageable) {
        Page<CandidateJobApplicationResponseDTO> availableJobs = jobPostingService.getAvailableJobPostings(pageable);
        return ResponseEntity.ok(availableJobs);
    }

    @PutMapping("/company/job-postings/{jobPostingId}")
    public ResponseEntity<Void> updateJobPosting(
            @AuthenticationPrincipal Company company,
            @PathVariable Long jobPostingId,
            @Valid @RequestBody UpdateJobPostingDTO updateJobPostingDTO
    ) {
        jobPostingService.updateJobPosting(company, jobPostingId, updateJobPostingDTO);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/company/job-postings/{jobPostingId}")
    public ResponseEntity<Void> deleteJobPosting(
            @AuthenticationPrincipal Company company,
            @PathVariable Long jobPostingId
    ) {
        jobPostingService.deleteJobPosting(company, jobPostingId);
        return ResponseEntity.ok().build();
    }
}
