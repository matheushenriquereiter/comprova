package org.example.comprova.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.example.comprova.enums.SkillLevel;

public record CandidateSkillRequestDTO(

        @NotBlank
        String skillName,

        @NotNull
        SkillLevel declaredLevel

) {
}