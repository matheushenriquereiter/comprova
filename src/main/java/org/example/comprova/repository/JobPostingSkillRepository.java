package org.example.comprova.repository;

import org.example.comprova.model.JobPostingSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JobPostingSkillRepository extends JpaRepository<JobPostingSkill, Long> {
}
