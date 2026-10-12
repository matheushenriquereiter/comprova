package org.example.comprova.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.comprova.dto.CandidateProfileResponseDTO;
import org.example.comprova.dto.ProfileUpdateResponseDTO;
import org.example.comprova.dto.UpdateCandidateProfileDTO;
import org.example.comprova.model.Candidate;
import org.example.comprova.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/candidate")
@RequiredArgsConstructor
public class CandidateController {
    private final AuthService authService;

    @GetMapping("/profile")
    public ResponseEntity<CandidateProfileResponseDTO> getProfile(@AuthenticationPrincipal Candidate candidate) {
        if (candidate == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(authService.getCandidateProfile(candidate));
    }

    @PutMapping("/profile")
    public ResponseEntity<ProfileUpdateResponseDTO> updateProfile(
            @AuthenticationPrincipal Candidate candidate,
            @Valid @RequestBody UpdateCandidateProfileDTO dto) {
        if (candidate == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(authService.updateCandidateProfile(candidate, dto));
    }
}
