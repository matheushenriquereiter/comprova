package org.example.comprova.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.comprova.dto.CreateJobPostingDTO;
import org.example.comprova.dto.JobPostingResponseDTO;
import org.example.comprova.model.Company;
import org.example.comprova.service.JobPostingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/job-postings")
@RequiredArgsConstructor
public class JobPostingController {
    private final JobPostingService jobPostingService;

    @PostMapping
    public ResponseEntity<Void> createJobPosting(@AuthenticationPrincipal Company company, @Valid @RequestBody CreateJobPostingDTO createJobPostingDTO) {
        jobPostingService.createJobPosting(company, createJobPostingDTO);

        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping
    public ResponseEntity<List<JobPostingResponseDTO>> getJobPostings(@AuthenticationPrincipal Company company) {
        List<JobPostingResponseDTO> jobPostings = jobPostingService.getJobPostings(company);

        return ResponseEntity.ok(jobPostings);
    }
}
