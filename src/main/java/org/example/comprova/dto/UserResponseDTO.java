package org.example.comprova.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserResponseDTO(
        @NotBlank(message = "Username cannot be null or empty")
        @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
        String username,

        @NotBlank(message = "User email cannot be null or empty")
        @Email(message = "Invalid email format")
        String email,

        @NotBlank(message = "Role cannot be null or empty")
        String role
) {
}
