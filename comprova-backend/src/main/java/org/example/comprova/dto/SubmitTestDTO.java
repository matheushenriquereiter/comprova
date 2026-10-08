package org.example.comprova.dto;

import java.util.Map;

public record SubmitTestDTO(
        Map<Long, String> answers
) {}
