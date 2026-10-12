package org.example.comprova.dto;

public record CompanyProfileResponseDTO(
        String username,
        String email,
        String legalName,
        String tradeName,
        String phone,
        String cnpj
) {
}
