package org.example.comprova.service;

import lombok.RequiredArgsConstructor;
import org.example.comprova.enums.TestAttemptStatus;
import org.example.comprova.exceptions.BusinessException;
import org.example.comprova.model.Candidate;
import org.example.comprova.model.JobApplication;
import org.example.comprova.model.JobPosting;
import org.example.comprova.model.TestAttempt;
import org.example.comprova.repository.JobApplicationRepository;
import org.example.comprova.repository.JobPostingRepository;
import org.example.comprova.repository.TestAttemptRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TestAttemptService {

    private final TestAttemptRepository testAttemptRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final JobPostingRepository jobPostingRepository;

    @Transactional
    public TestAttempt startAttempt(
            Candidate candidate,
            Long jobPostingId
    ) {

        JobPosting jobPosting = jobPostingRepository.findById(jobPostingId)
                .orElseThrow(() -> new BusinessException(
                        HttpStatus.NOT_FOUND,
                        "Job posting not found."
                ));

        JobApplication jobApplication =
                jobApplicationRepository.findByCandidateAndJobPosting(
                                candidate,
                                jobPosting
                        )
                        .orElseThrow(() -> new BusinessException(
                                HttpStatus.FORBIDDEN,
                                "Candidate has not applied to this job posting."
                        ));

        Optional<TestAttempt> existingAttempt =
                testAttemptRepository.findByJobApplicationAndStatus(
                        jobApplication,
                        TestAttemptStatus.STARTED
                );

        if (existingAttempt.isPresent()) {
            return existingAttempt.get();
        }

        TestAttempt testAttempt = new TestAttempt();
        testAttempt.setJobApplication(jobApplication);
        testAttempt.setStatus(TestAttemptStatus.STARTED);
        testAttempt.setStartedAt(LocalDateTime.now());

        return testAttemptRepository.save(testAttempt);
    }
}