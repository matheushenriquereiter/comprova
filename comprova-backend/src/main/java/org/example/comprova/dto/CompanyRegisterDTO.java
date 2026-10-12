package org.example.comprova.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.example.comprova.validation.MaxUtf8Bytes;
import org.hibernate.validator.constraints.br.CNPJ;

import java.util.Locale;

public record CompanyRegisterDTO(
        @NotBlank(message = "Username cannot be null or empty.")
        @Size(min = 3, max = 20, message = "Username must be between 3 and 20 characters.")
        @Pattern(regexp = "^[A-Za-z0-9._-]*$", message = "Username may only contain letters, numbers, dots, hyphens and underscores.")
        String username,

        @NotBlank(message = "Email cannot be null or empty.")
        @Email(message = "Invalid email format.")
        @Size(max = 254, message = "Email must have at most 254 characters.")
        String email,

        @NotBlank(message = "Password cannot be null or empty.")
        @Size(min = 8, max = 72, message = "Password must be between 8 and 72 characters.")
        @MaxUtf8Bytes(value = 72, message = "Password is too long.")
        String password,

        @NotBlank(message = "Company legal name cannot be null or empty.")
        @Size(min = 3, max = 255, message = "Legal name must be between 3 and 255 characters.")
        String legalName,

        @NotBlank(message = "Company trade name cannot be null or empty.")
        @Size(min = 3, max = 255, message = "Trade name must be between 3 and 255 characters.")
        String tradeName,

        @NotBlank(message = "Company phone cannot be null or empty.")
        @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Phone must be a valid number with 10 to 15 digits.")
        String phone,

        @NotBlank(message = "Company CNPJ cannot be null or empty.")
        @CNPJ(message = "Invalid CNPJ format.")
        @Pattern(regexp = "\\d{14}", message = "CNPJ must contain exactly 14 numeric digits.")
        String cnpj
) {
    public CompanyRegisterDTO {
        username = username == null ? null : username.trim();
        email = email == null ? null : email.trim().toLowerCase(Locale.ROOT);
        legalName = legalName == null ? null : legalName.trim();
        tradeName = tradeName == null ? null : tradeName.trim();
        phone = phone == null ? null : phone.replaceAll("[\\s()\\-]", "");
        cnpj = cnpj == null ? null : cnpj.replaceAll("\\D", "");
    }
}
