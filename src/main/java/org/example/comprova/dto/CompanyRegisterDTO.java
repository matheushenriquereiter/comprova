package org.example.comprova.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.br.CNPJ;

public record CompanyRegisterDTO(
        @NotBlank(message = "Username cannot be null or empty")
        @Size(min = 3, max = 20, message = "Username must be between 3 and 20 characters")
        String username,

        @NotBlank(message = "Email cannot be null or empty")
        @Email(message = "Invalid email format")
        String email,

        @NotBlank(message = "Password cannot be null or empty")
        @Size(min = 8, max = 128, message = "Password must be between 8 and 128 characters")
        String password,

        @NotBlank(message = "Company legal name cannot be null or empty")
        @Size(min = 3, max = 255, message = "Legal name must be between 3 and 255 characters")
        String legalName,

        @NotBlank(message = "Company trade name cannot be null or empty")
        @Size(min = 3, max = 255, message = "Trade name must be between 3 and 255 characters")
        String tradeName,

        @NotBlank(message = "Company phone cannot be null or empty")
        @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Phone must be a valid number with 10 to 15 digits")
        String phone,

        @NotBlank(message = "Company CNPJ cannot be null or empty")
        @CNPJ(message = "Invalid CNPJ format")
        @Pattern(regexp = "\\d{14}", message = "CNPJ must contain exactly 14 numeric digits")
        String cnpj
) {
}
