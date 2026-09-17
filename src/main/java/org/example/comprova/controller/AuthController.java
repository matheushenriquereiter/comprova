package org.example.comprova.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.comprova.dto.*;
import org.example.comprova.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/sign-up/candidate")
    public ResponseEntity<Void> signUpCandidate(@Valid @RequestBody CandidateRegisterDTO candidateRegisterDTO) {
        authService.signUpCandidate(candidateRegisterDTO);

        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/sign-up/company")
    public ResponseEntity<Void> signUpCompany(@Valid @RequestBody CompanyRegisterDTO companyRegisterDTO) {
        authService.signUpCompany(companyRegisterDTO);

        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/sign-in")
    public ResponseEntity<TokenDTO> signIn(@Valid @RequestBody UserLoginDTO userLoginDTO) {
        TokenDTO tokenDTO = authService.signIn(userLoginDTO);

        return ResponseEntity.ok(tokenDTO);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> me(Principal principal) {
        UserResponseDTO userResponseDTO = authService.me(principal.getName());

        return ResponseEntity.status(HttpStatus.CREATED).body(userResponseDTO);
    }
}
