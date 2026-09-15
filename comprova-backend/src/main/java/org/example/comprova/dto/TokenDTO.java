package org.example.comprova.dto;

import jakarta.validation.constraints.NotBlank;

public record TokenDTO(
        @NotBlank(message = "JWT token cannot be null or empty")
        String token
) {
}
