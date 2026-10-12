package org.example.comprova.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.Map;

public record SubmitTestDTO(
        @NotNull(message = "Answers map cannot be null.")
        @Size(max = 50, message = "Too many answers.")
        Map<@NotNull(message = "Answer key cannot be null.") Long,
                @Size(max = 10000, message = "Each answer must have at most 10000 characters.") String> answers
) {}
