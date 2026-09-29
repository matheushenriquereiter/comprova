package org.example.comprova.repository;

import org.example.comprova.model.Company;
import org.example.comprova.model.JobPosting;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface JobPostingRepository extends JpaRepository<JobPosting, Long> {
    Page<JobPosting> findAllByCompany(Company company, Pageable pageable);
}
