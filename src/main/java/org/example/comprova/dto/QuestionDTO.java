package org.example.comprova.dto;

import org.example.comprova.enums.QuestionType;

public record QuestionDTO(
        String statement,
        QuestionType type
) {
}
