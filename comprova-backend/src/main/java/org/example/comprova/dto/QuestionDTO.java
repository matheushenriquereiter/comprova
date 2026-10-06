package org.example.comprova.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.example.comprova.enums.QuestionType;

import java.util.List;

public record QuestionDTO(
        @NotBlank(message = "Question statement cannot be blank.")
        String statement,

        @NotNull(message = "Question type cannot be null.")
        QuestionType type,

        @NotBlank(message = "Evaluated skill cannot be null or empty.")
        String skillEvaluated,

        @NotNull(message = "Estimated time cannot be null.")
        Integer estimatedTimeMinutes,

        @NotBlank(message = "Expected answer cannot be null or empty.")
        String expectedAnswer,

        @NotBlank(message = "Code snippet cannot be null or empty.")
        String codeSnippet,

        @NotEmpty(message = "Evaluation criteria cannot be empty.")
        List<String> evaluationCriteria
) {
}
