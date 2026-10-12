package org.example.comprova.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record GenerateQuestionsDTO(
        @NotBlank(message = "Job description cannot be blank.")
        @Size(min = 10, max = 5000, message = "Job description must be between 10 and 5000 characters.")
        String description,

        @NotEmpty(message = "Skills cannot be empty.")
        @Size(max = 20, message = "A job posting can have at most 20 skills.")
        List<@Valid @NotNull(message = "Skill cannot be null.") JobSkillRequirementDTO> skills
) {
}