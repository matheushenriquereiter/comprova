package org.example.comprova.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.comprova.dto.CandidateJobApplicationResponseDTO;
import org.example.comprova.dto.CandidateApplicationDTO;
import org.example.comprova.dto.CandidateQuestionDTO;
import org.example.comprova.dto.CreateJobPostingDTO;
import org.example.comprova.dto.JobPostingResponseDTO;
import org.example.comprova.dto.SubmitTestDTO;
import org.example.comprova.dto.UpdateApplicationStatusDTO;
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
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class JobPostingController {
    private final JobPostingService jobPostingService;

    @PostMapping("/company/job-postings")
    public ResponseEntity<Void> createJobPosting(@AuthenticationPrincipal Company company, @Valid @RequestBody CreateJobPostingDTO createJobPostingDTO) {
        if (company == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        jobPostingService.createJobPosting(company, createJobPostingDTO);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/company/job-postings/{jobPostingId}")
    public ResponseEntity<JobPostingResponseDTO> getCompanyJobPosting(
            @AuthenticationPrincipal Company company,
            @PathVariable Long jobPostingId
    ) {
        if (company == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        JobPostingResponseDTO jobPosting = jobPostingService.getJobPostingById(company, jobPostingId);
        return ResponseEntity.ok(jobPosting);
    }

    @GetMapping("/company/job-postings")
    public ResponseEntity<Page<JobPostingResponseDTO>> getCompanyJobPostings(@AuthenticationPrincipal Company company, Pageable pageable) {
        if (company == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Page<JobPostingResponseDTO> jobPostings = jobPostingService.getCompanyJobPostings(company, pageable);
        return ResponseEntity.ok(jobPostings);
    }

    @PostMapping("/candidate/job-postings/{jobPostingId}/applications")
    public ResponseEntity<Void> applyToJobPosting(
            @AuthenticationPrincipal Candidate candidate,
            @PathVariable("jobPostingId") Long jobPostingId
    ) {
        if (candidate == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        jobPostingService.applyToJobPosting(candidate, jobPostingId);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/candidate/job-postings")
    public ResponseEntity<Page<CandidateApplicationDTO>> getCandidateApplications(@AuthenticationPrincipal Candidate candidate, Pageable pageable) {
        if (candidate == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Page<CandidateApplicationDTO> candidateApplications = jobPostingService.getCandidateApplications(candidate, pageable);
        return ResponseEntity.ok(candidateApplications);
    }

    @GetMapping("/candidate/applications/{applicationId}/test")
    public ResponseEntity<List<CandidateQuestionDTO>> getTestQuestions(
            @AuthenticationPrincipal Candidate candidate,
            @PathVariable Long applicationId) {
        if (candidate == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(jobPostingService.getApplicationTestQuestions(applicationId, candidate));
    }

    @PostMapping("/candidate/applications/{applicationId}/test")
    public ResponseEntity<Map<String, Object>> submitTest(
            @Valid @RequestBody SubmitTestDTO submitTestDTO,
            @AuthenticationPrincipal Candidate candidate,
            @PathVariable Long applicationId) {
        if (candidate == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Integer score = jobPostingService.submitApplicationTest(applicationId, candidate, submitTestDTO);
        return ResponseEntity.ok(Map.of(
                "score", score,
                "status", "TEST_COMPLETED"
        ));
    }

    @PutMapping({
            "/company/applications/{applicationId}/status",
            "/company/job-postings/{jobPostingId}/applications/{applicationId}/status"
    })
    public ResponseEntity<Void> updateApplicationStatus(
            @AuthenticationPrincipal Company company,
            @PathVariable(value = "jobPostingId", required = false) Long jobPostingId,
            @PathVariable("applicationId") Long applicationId,
            @Valid @RequestBody UpdateApplicationStatusDTO updateApplicationStatusDTO
    ) {
        if (company == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        jobPostingService.updateApplicationStatus(company, applicationId, updateApplicationStatusDTO);
        return ResponseEntity.ok().build();
    }

    @PatchMapping({
            "/company/applications/{applicationId}/status",
            "/company/job-postings/{jobPostingId}/applications/{applicationId}/status"
    })
    public ResponseEntity<Void> patchApplicationStatus(
            @AuthenticationPrincipal Company company,
            @PathVariable(value = "jobPostingId", required = false) Long jobPostingId,
            @PathVariable("applicationId") Long applicationId,
            @Valid @RequestBody UpdateApplicationStatusDTO updateApplicationStatusDTO
    ) {
        if (company == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        jobPostingService.updateApplicationStatus(company, applicationId, updateApplicationStatusDTO);
        return ResponseEntity.ok().build();
    }

    @PostMapping({
            "/company/applications/{applicationId}/status",
            "/company/job-postings/{jobPostingId}/applications/{applicationId}/status"
    })
    public ResponseEntity<Void> postApplicationStatus(
            @AuthenticationPrincipal Company company,
            @PathVariable(value = "jobPostingId", required = false) Long jobPostingId,
            @PathVariable("applicationId") Long applicationId,
            @Valid @RequestBody UpdateApplicationStatusDTO updateApplicationStatusDTO
    ) {
        if (company == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        jobPostingService.updateApplicationStatus(company, applicationId, updateApplicationStatusDTO);
        return ResponseEntity.ok().build();
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
        if (company == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        jobPostingService.updateJobPosting(company, jobPostingId, updateJobPostingDTO);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/company/job-postings/{jobPostingId}")
    public ResponseEntity<Void> deleteJobPosting(
            @AuthenticationPrincipal Company company,
            @PathVariable Long jobPostingId
    ) {
        if (company == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        jobPostingService.deleteJobPosting(company, jobPostingId);
        return ResponseEntity.ok().build();
    }
}
