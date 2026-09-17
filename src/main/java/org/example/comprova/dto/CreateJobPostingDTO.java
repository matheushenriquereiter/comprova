package org.example.comprova.dto;

import java.time.LocalDateTime;

public record CreateJobPostingDTO(
        String title,
        LocalDateTime expiresAt
) {
}
