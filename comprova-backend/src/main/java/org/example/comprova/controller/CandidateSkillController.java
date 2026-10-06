package org.example.comprova.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.comprova.dto.CandidateSkillRequestDTO;
import org.example.comprova.dto.CandidateSkillResponseDTO;
import org.example.comprova.model.Candidate;
import org.example.comprova.service.CandidateSkillService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CandidateSkillController {

    private final CandidateSkillService candidateSkillService;

    @PostMapping("/candidate/skills")
    public ResponseEntity<Void> addSkill(
            @AuthenticationPrincipal Candidate candidate,
            @Valid @RequestBody CandidateSkillRequestDTO candidateSkillRequestDTO
    ) {

        candidateSkillService.addSkill(
                candidate,
                candidateSkillRequestDTO
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .build();
    }

    @GetMapping("/candidate/skills")
    public ResponseEntity<List<CandidateSkillResponseDTO>> getCandidateSkills(
            @AuthenticationPrincipal Candidate candidate
    ) {

        List<CandidateSkillResponseDTO> candidateSkills =
                candidateSkillService.getCandidateSkills(candidate);

        return ResponseEntity.ok(candidateSkills);
    }
}