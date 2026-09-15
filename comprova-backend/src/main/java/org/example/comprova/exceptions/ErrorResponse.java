package org.example.comprova.exceptions;

import lombok.Getter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Getter
public class ErrorResponse {
    private final int status;
    private final String message;
    private final Instant timestamp = Instant.now();
    private final List<FieldError> errors = new ArrayList<>();

    public ErrorResponse(int status, String message) {
        this.status = status;
        this.message = message;
    }

    public void addFieldError(String field, String message) {
        errors.add(new FieldError(field, message));
    }

    private record FieldError(String field, String message) {
    }
}
