package org.example.comprova.dto;

public record CompanyProfileDTO(
        String legalName,
        String tradeName,
        String cnpj,
        String email,
        String phone
) {
}
