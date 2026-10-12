package org.example.comprova.dto;

public record ProfileUpdateResponseDTO(
        String username,
        String email,
        String token,
        String message
) {
}
