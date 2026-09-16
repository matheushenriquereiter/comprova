package org.example.comprova.dto;

import jakarta.validation.constraints.NotBlank;

public record CandidateRegisterDTO (
        @NotBlank(message = "Username cannot be null or empty")
        String username,

        @NotBlank(message = "User email cannot be null or empty")
        String email,

        @NotBlank(message = "User password cannot be null or empty")
        String password,

        @NotBlank(message = "User cpf cannot be null or empty")
        String cpf
) {
}

