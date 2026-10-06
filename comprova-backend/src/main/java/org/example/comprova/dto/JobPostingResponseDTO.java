package org.example.comprova.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.example.comprova.enums.JobPostingStatus;

import java.time.LocalDateTime;
import java.util.List;

public record JobPostingResponseDTO(
        @NotNull(message = "ID cannot be null.")
        Long id,

        @NotBlank(message = "Job title cannot be null or empty.")
        @Size(min = 5, max = 100, message = "Job title must be between 5 and 100 characters.")
        String title,

        @NotNull(message = "Status cannot be null.")
        JobPostingStatus status,

        @NotNull(message = "Expiration date cannot be null.")
        LocalDateTime expiresAt,

        List<CandidateResponseDTO> candidates,

        List<JobSkillRequirementDTO> skills
) {
}
