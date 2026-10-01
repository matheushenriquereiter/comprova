package org.example.comprova.dto;

import jakarta.validation.constraints.NotNull;

public record JobSkillRequirementDTO(
        @NotNull(message = "Skill name cannot be null.")
        String name,

        @NotNull(message = "Skill weight cannot be null.")
        Integer weight
) {
}
