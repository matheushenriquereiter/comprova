package org.example.comprova.repository;

import org.example.comprova.model.Candidate;
import org.example.comprova.model.JobApplication;
import org.example.comprova.model.JobPosting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    boolean existsByCandidateAndJobPosting(Candidate candidate, JobPosting jobPosting);
}
