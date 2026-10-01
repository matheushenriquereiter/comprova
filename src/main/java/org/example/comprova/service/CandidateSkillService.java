package org.example.comprova.service;

import lombok.RequiredArgsConstructor;
import org.example.comprova.dto.CandidateSkillRequestDTO;
import org.example.comprova.dto.CandidateSkillResponseDTO;
import org.example.comprova.exceptions.BusinessException;
import org.example.comprova.model.Candidate;
import org.example.comprova.model.CandidateSkill;
import org.example.comprova.model.Skill;
import org.example.comprova.repository.CandidateSkillRepository;
import org.example.comprova.repository.SkillRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CandidateSkillService {

    private final CandidateSkillRepository candidateSkillRepository;
    private final SkillRepository skillRepository;

    @Transactional
    public void addSkill(
            Candidate candidate,
            CandidateSkillRequestDTO candidateSkillRequestDTO
    ) {

        Skill skill = skillRepository
                .findByNameIgnoreCase(candidateSkillRequestDTO.skillName())
                .orElseGet(() ->
                        skillRepository.save(
                                new Skill(candidateSkillRequestDTO.skillName())
                        )
                );

        if (candidateSkillRepository
                .findByCandidateAndSkill(candidate, skill)
                .isPresent()) {

            throw new BusinessException(
                    HttpStatus.CONFLICT,
                    "Candidate already has this skill."
            );
        }

        CandidateSkill candidateSkill = new CandidateSkill(
                candidate,
                skill,
                candidateSkillRequestDTO.declaredLevel()
        );

        candidateSkillRepository.save(candidateSkill);
    }

    @Transactional(readOnly = true)
    public List<CandidateSkillResponseDTO> getCandidateSkills(
            Candidate candidate
    ) {

        return candidateSkillRepository
                .findByCandidate(candidate)
                .stream()
                .map(CandidateSkillService::mapToResponseDTO)
                .toList();
    }

    private static CandidateSkillResponseDTO mapToResponseDTO(
            CandidateSkill candidateSkill
    ) {

        return new CandidateSkillResponseDTO(
                candidateSkill.getSkill().getId(),
                candidateSkill.getSkill().getName(),
                candidateSkill.getDeclaredLevel(),
                candidateSkill.getValidatedScore()
        );
    }
}