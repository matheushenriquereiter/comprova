package org.example.comprova.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.example.comprova.enums.QuestionType;

import java.util.List;

public record QuestionDTO(
        @NotBlank(message = "Question statement cannot be blank.")
        @Size(max = 10000, message = "Question statement must have at most 10000 characters.")
        String statement,

        @NotNull(message = "Question type cannot be null.")
        QuestionType type,

        @NotBlank(message = "Evaluated skill cannot be null or empty.")
        @Size(max = 100, message = "Evaluated skill must have at most 100 characters.")
        String skillEvaluated,

        @NotNull(message = "Estimated time cannot be null.")
        @Min(value = 1, message = "Estimated time must be at least 1 minute.")
        @Max(value = 240, message = "Estimated time cannot exceed 240 minutes.")
        Integer estimatedTimeMinutes,

        @NotBlank(message = "Expected answer cannot be null or empty.")
        @Size(max = 10000, message = "Expected answer must have at most 10000 characters.")
        String expectedAnswer,

        @NotBlank(message = "Code snippet cannot be null or empty.")
        @Size(max = 10000, message = "Code snippet must have at most 10000 characters.")
        String codeSnippet,

        @NotEmpty(message = "Evaluation criteria cannot be empty.")
        @Size(max = 10, message = "A question can have at most 10 evaluation criteria.")
        List<@NotBlank(message = "Evaluation criterion cannot be blank.")
             @Size(max = 255, message = "Evaluation criterion must have at most 255 characters.") String> evaluationCriteria
) {
}
