package org.example.comprova.dto;

import org.example.comprova.enums.JobPostingStatus;

import java.time.LocalDateTime;

public record JobPostingResponseDTO(
        String title,
        JobPostingStatus status,
        LocalDateTime expiresAt) {
}
