package org.example.comprova.repository;

import org.example.comprova.model.Candidate;
import org.example.comprova.model.Company;
import org.example.comprova.model.JobPosting;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface JobPostingRepository extends JpaRepository<JobPosting, Long> {
    Page<JobPosting> findAllByCompanyOrderByCreatedAtDesc(Company company, Pageable pageable);

    Page<JobPosting> findAllByJobApplications_CandidateOrderByCreatedAtDesc(Candidate candidate, Pageable pageable);

    Page<JobPosting> findAllByStatusOrderByCreatedAtDesc(org.example.comprova.enums.JobPostingStatus status, Pageable pageable);
}
