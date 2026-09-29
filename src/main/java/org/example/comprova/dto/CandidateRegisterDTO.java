package org.example.comprova.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.br.CPF;

public record CandidateRegisterDTO(
        @NotBlank(message = "Username cannot be null or empty")
        @Size(min = 3, max = 20, message = "Username must be between 3 and 20 characters")
        String username,

        @NotBlank(message = "User email cannot be null or empty")
        @Email(message = "Invalid email format")
        String email,

        @NotBlank(message = "User password cannot be null or empty")
        @Size(min = 8, max = 128, message = "Password must be between 8 and 128 characters")
        String password,

        @NotBlank(message = "User cpf cannot be null or empty")
        @CPF(message = "Invalid CPF number")
        @Pattern(regexp = "\\d{11}", message = "CPF must contain exactly 11 numeric digits")
        String cpf
) {
}
