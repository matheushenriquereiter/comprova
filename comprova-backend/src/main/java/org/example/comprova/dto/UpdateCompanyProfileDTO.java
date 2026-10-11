package org.example.comprova.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateCompanyProfileDTO(
        @NotBlank(message = "Company legal name cannot be null or empty.")
        @Size(min = 3, max = 255, message = "Legal name must be between 3 and 255 characters.")
        String legalName,

        @NotBlank(message = "Company trade name cannot be null or empty.")
        @Size(min = 3, max = 255, message = "Trade name must be between 3 and 255 characters.")
        String tradeName,

        @NotBlank(message = "Email cannot be null or empty.")
        @Email(message = "Invalid email format.")
        String email,

        @NotBlank(message = "Company phone cannot be null or empty.")
        @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Phone must be a valid number with 10 to 15 digits.")
        String phone,

        // Os dois campos abaixo são opcionais: só preencha para trocar a senha.
        String currentPassword,

        @Size(min = 8, max = 128, message = "Password must be between 8 and 128 characters.")
        String newPassword
) {
}
