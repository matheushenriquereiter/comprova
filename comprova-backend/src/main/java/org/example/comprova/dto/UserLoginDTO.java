package org.example.comprova.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.example.comprova.validation.MaxUtf8Bytes;

import java.util.Locale;

public record UserLoginDTO(
        @NotBlank(message = "User email cannot be null or empty.")
        @Email(message = "Invalid email format.")
        @Size(max = 254, message = "Email must have at most 254 characters.")
        String email,

        @NotBlank(message = "User password cannot be null or empty.")
        @Size(max = 72, message = "Password must have at most 72 characters.")
        @MaxUtf8Bytes(value = 72, message = "Password is too long.")
        String password
) {
    public UserLoginDTO {
        email = email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }
}
