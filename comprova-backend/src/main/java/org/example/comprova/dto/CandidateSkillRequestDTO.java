package org.example.comprova.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.example.comprova.enums.SkillLevel;

public record CandidateSkillRequestDTO(

        @NotBlank(message = "Skill name cannot be null or empty.")
        @Size(max = 50, message = "Skill name must have at most 50 characters.")
        String skillName,

        @NotNull(message = "Declared level cannot be null.")
        SkillLevel declaredLevel

) {
    public CandidateSkillRequestDTO {
        skillName = skillName == null ? null : skillName.trim();
    }
}