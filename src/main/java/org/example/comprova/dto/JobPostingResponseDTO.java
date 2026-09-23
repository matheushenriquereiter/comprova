package org.example.comprova.dto;

import org.example.comprova.enums.JobPostingStatus;

import java.time.LocalDateTime;
import java.util.List;

public record JobPostingResponseDTO(
        String title,
        JobPostingStatus status,
        LocalDateTime expiresAt,
        List<CandidateResponseDTO> candidates,
        List<SkillDTO> skills
) {
}
