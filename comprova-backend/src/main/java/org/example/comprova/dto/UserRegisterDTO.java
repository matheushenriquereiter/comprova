package org.example.comprova.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserRegisterDTO(
        @NotBlank(message = "Username cannot be null or empty.")
        @Size(min = 3, max = 20, message = "Username must be between 3 and 20 characters.")
        String username,

        @NotBlank(message = "User email cannot be null or empty.")
        @Email(message = "Invalid email format.")
        String email,

        @NotBlank(message = "User password cannot be null or empty.")
        @Size(min = 8, max = 128, message = "Password must be between 8 and 128 characters.")
        String password
) {
}
