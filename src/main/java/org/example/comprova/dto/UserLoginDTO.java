package org.example.comprova.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UserLoginDTO(
        @NotBlank(message = "User email cannot be null or empty.")
        @Email(message = "Invalid email format.")
        String email,

        @NotBlank(message = "User password cannot be null or empty.")
        String password
) {
}
