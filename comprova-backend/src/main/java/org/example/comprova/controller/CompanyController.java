package org.example.comprova.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.comprova.dto.CompanyProfileResponseDTO;
import org.example.comprova.dto.ProfileUpdateResponseDTO;
import org.example.comprova.dto.UpdateCompanyProfileDTO;
import org.example.comprova.model.Company;
import org.example.comprova.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/company")
@RequiredArgsConstructor
public class CompanyController {
    private final AuthService authService;

    @GetMapping("/profile")
    public ResponseEntity<CompanyProfileResponseDTO> getProfile(@AuthenticationPrincipal Company company) {
        if (company == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(authService.getCompanyProfile(company));
    }
    
    @PutMapping("/profile")
    public ResponseEntity<ProfileUpdateResponseDTO> updateProfile(
            @AuthenticationPrincipal Company company,
            @Valid @RequestBody UpdateCompanyProfileDTO dto) {
        if (company == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(authService.updateCompanyProfile(company, dto));
    }
}
