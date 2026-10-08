package org.example.comprova.repository;

import org.example.comprova.model.Candidate;
import org.example.comprova.model.JobApplication;
import org.example.comprova.model.JobPosting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    boolean existsByCandidateAndJobPosting(
            Candidate candidate,
            JobPosting jobPosting
    );

    Optional<JobApplication> findByCandidateAndJobPosting(
            Candidate candidate,
            JobPosting jobPosting
    );
}