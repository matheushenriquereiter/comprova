package org.example.comprova.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record GenerateQuestionsDTO(
        @NotBlank
        String description,

        @NotEmpty
        List<JobSkillRequirementDTO> skills
) {
}