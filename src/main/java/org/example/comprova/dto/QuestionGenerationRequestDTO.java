package org.example.comprova.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record QuestionGenerationRequestDTO(

        @NotBlank
        String description,

        @NotEmpty
        @Valid
        List<JobSkillRequirementDTO> skills

) {
}