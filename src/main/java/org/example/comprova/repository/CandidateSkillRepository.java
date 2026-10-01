package org.example.comprova.repository;

import org.example.comprova.model.Candidate;
import org.example.comprova.model.CandidateSkill;
import org.example.comprova.model.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CandidateSkillRepository extends JpaRepository<CandidateSkill, Long> {

    List<CandidateSkill> findByCandidate(Candidate candidate);

    Optional<CandidateSkill> findByCandidateAndSkill(
            Candidate candidate,
            Skill skill
    );
}