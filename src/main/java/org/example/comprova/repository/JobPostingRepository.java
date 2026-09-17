package org.example.comprova.repository;

import org.example.comprova.model.Company;
import org.example.comprova.model.JobPosting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobPostingRepository extends JpaRepository<JobPosting, Long> {
    List<JobPosting> findAllByCompany(Company company);
}
