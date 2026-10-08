package org.example.comprova.dto;

import org.example.comprova.enums.QuestionType;

public record CandidateQuestionDTO(
        Long id,
        String statement,
        QuestionType type,
        String skillEvaluated,
        Integer estimatedTimeMinutes,
        String codeSnippet
) {
}