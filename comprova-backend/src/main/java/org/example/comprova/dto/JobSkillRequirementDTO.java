package org.example.comprova.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record JobSkillRequirementDTO(
        @NotBlank(message = "Skill name cannot be null or empty.")
        @Size(min = 1, max = 50, message = "Skill name must be between 1 and 50 characters.")
        String name,

        @NotNull(message = "Skill weight cannot be null.")
        @Min(value = 1, message = "Skill weight must be at least 1.")
        @Max(value = 100, message = "Skill weight cannot exceed 100.")
        Integer weight
) {
    public JobSkillRequirementDTO {
        name = name == null ? null : name.trim();
    }
}
