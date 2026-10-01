package org.example.comprova.dto;

import jakarta.validation.constraints.NotBlank;

public record PromptDTO(
        @NotBlank(message = "Prompt cannot be null or empty")
        String prompt
) {
}
