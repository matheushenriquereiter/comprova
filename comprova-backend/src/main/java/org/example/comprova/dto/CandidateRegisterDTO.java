package org.example.comprova.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.example.comprova.validation.MaxUtf8Bytes;
import org.hibernate.validator.constraints.br.CPF;

import java.util.Locale;

public record CandidateRegisterDTO(
        @NotBlank(message = "Username cannot be null or empty.")
        @Size(min = 3, max = 20, message = "Username must be between 3 and 20 characters.")
        @Pattern(regexp = "^[A-Za-z0-9._-]*$", message = "Username may only contain letters, numbers, dots, hyphens and underscores.")
        String username,

        @NotBlank(message = "User email cannot be null or empty.")
        @Email(message = "Invalid email format.")
        @Size(max = 254, message = "Email must have at most 254 characters.")
        String email,

        @NotBlank(message = "User password cannot be null or empty.")
        @Size(min = 8, max = 72, message = "Password must be between 8 and 72 characters.")
        @MaxUtf8Bytes(value = 72, message = "Password is too long.")
        String password,

        @NotBlank(message = "User cpf cannot be null or empty.")
        @CPF(message = "Invalid CPF number.")
        String cpf
) {
    public CandidateRegisterDTO {
        username = username == null ? null : username.trim();
        email = email == null ? null : email.trim().toLowerCase(Locale.ROOT);
        cpf = cpf == null ? null : cpf.replaceAll("\\D", "");
    }
}
