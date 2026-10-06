package org.example.comprova.repository;

import org.example.comprova.model.JobSkillRequirement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JobSkillRequirementRepository extends JpaRepository<JobSkillRequirement, Long> {
}
