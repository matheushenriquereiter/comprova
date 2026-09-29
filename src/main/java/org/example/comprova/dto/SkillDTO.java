package org.example.comprova.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SkillDTO(
        @NotBlank(message = "Skill name cannot be null or empty")
        @Size(min = 1, max = 50, message = "Skill name must be between 1 and 50 characters")
        String name
) {
}
