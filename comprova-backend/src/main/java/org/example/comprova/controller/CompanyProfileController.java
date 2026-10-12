package org.example.comprova.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.comprova.dto.CompanyProfileDTO;
import org.example.comprova.dto.UpdateCompanyProfileDTO;
import org.example.comprova.model.Company;
import org.example.comprova.service.CompanyProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class CompanyProfileController {
    private final CompanyProfileService companyProfileService;

    @GetMapping("/company/profile")
    public ResponseEntity<CompanyProfileDTO> getProfile(@AuthenticationPrincipal Company company) {
        return ResponseEntity.ok(companyProfileService.getProfile(company));
    }

    @PutMapping("/company/profile")
    public ResponseEntity<CompanyProfileDTO> updateProfile(
            @AuthenticationPrincipal Company company,
            @Valid @RequestBody UpdateCompanyProfileDTO updateCompanyProfileDTO
    ) {
        return ResponseEntity.ok(companyProfileService.updateProfile(company, updateCompanyProfileDTO));
    }
}
