package org.example.comprova.dto;

import jakarta.validation.constraints.NotBlank;

public record CompanyRegisterDTO(
        @NotBlank(message = "Company username cannot be null or empty")
        String username,

        @NotBlank(message = "Company email cannot be null or empty")
        String email,

        @NotBlank(message = "Company password cannot be null or empty")
        String password,

        @NotBlank(message = "Company legal name cannot be null or empty")
        String legalName
) {
}

