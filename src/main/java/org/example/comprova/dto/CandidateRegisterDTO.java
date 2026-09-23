package org.example.comprova.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.br.CPF;

public record CandidateRegisterDTO (
        @NotBlank(message = "Username cannot be null or empty")
        @Size(min = 3, max = 50, message = "Username must be betwenn 3 and 50 characters")
        String username,

        @NotBlank(message = "User email cannot be null or empty")
        @Email(message = "Invalid email format")
        String email,

        @NotBlank(message = "User password cannot be null or empty")
        @Size(min = 6, max = 8, message = "Password must be beteween 6 and 8 characters")
        String password,

        @NotBlank(message = "User cpf cannot be null or empty")
        @CPF(message = "Invalid CPF number")
        @Pattern(regexp = "\\d{11}", message = "CPF must contain exactly 11 numeric digits")
        String cpf
) {
}

