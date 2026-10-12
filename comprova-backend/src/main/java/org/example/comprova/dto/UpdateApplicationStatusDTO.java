package org.example.comprova.dto;

import jakarta.validation.constraints.NotNull;
import org.example.comprova.enums.ApplicationStatus;

public record UpdateApplicationStatusDTO(
        @NotNull(message = "Status cannot be null.")
        ApplicationStatus status
) {
}
