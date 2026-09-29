package org.example.comprova.service;

import lombok.RequiredArgsConstructor;
import org.example.comprova.dto.*;
import org.example.comprova.exceptions.BusinessException;
import org.example.comprova.model.Candidate;
import org.example.comprova.model.Company;
import org.example.comprova.model.User;
import org.example.comprova.repository.CompanyRepository;
import org.example.comprova.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final JwtService jwtService;

    public void signUpCandidate(CandidateRegisterDTO candidateRegisterDTO) {
        userRepository.getUserByEmail(candidateRegisterDTO.email()).ifPresent(user -> {
            throw new BusinessException(HttpStatus.CONFLICT, "Email already taken");
        });
        userRepository.getUserByUsername(candidateRegisterDTO.username()).ifPresent(user -> {
            throw new BusinessException(HttpStatus.CONFLICT, "Username already taken");
        });

        String encodedPassword = passwordEncoder.encode(candidateRegisterDTO.password());

        userRepository.save(new Candidate(candidateRegisterDTO.username(), candidateRegisterDTO.email(), encodedPassword, candidateRegisterDTO.cpf()));
    }

    public void signUpCompany(CompanyRegisterDTO companyRegisterDTO) {
        userRepository.getUserByEmail(companyRegisterDTO.email()).ifPresent(user -> {
            throw new BusinessException(HttpStatus.CONFLICT, "Email already taken");
        });
        userRepository.getUserByUsername(companyRegisterDTO.username()).ifPresent(user -> {
            throw new BusinessException(HttpStatus.CONFLICT, "Username already taken");
        });
        companyRepository.findByCnpj(companyRegisterDTO.cnpj()).ifPresent(company -> {
            throw new BusinessException(HttpStatus.CONFLICT, "CNPJ already taken");
        });

        String encodedPassword = passwordEncoder.encode(companyRegisterDTO.password());
        Company companyToRegister = new Company(
                companyRegisterDTO.username(),
                companyRegisterDTO.email(),
                encodedPassword,
                companyRegisterDTO.legalName(),
                companyRegisterDTO.tradeName(),
                companyRegisterDTO.phone(),
                companyRegisterDTO.cnpj()
        );

        userRepository.save(companyToRegister);
    }

    public TokenDTO signIn(UserLoginDTO userLoginDTO) {
        User user = userRepository.getUserByEmail(userLoginDTO.email()).orElseThrow(() -> new BusinessException(HttpStatus.BAD_REQUEST, "Invalid credentials"));

        if (!passwordEncoder.matches(userLoginDTO.password(), user.getPassword())) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "Invalid credentials");
        }

        return new TokenDTO(jwtService.generateToken(user.getUsername()));
    }

    public UserResponseDTO me(String username) {
        User user = userRepository.getUserByUsername(username).orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "User not found"));

        return new UserResponseDTO(user.getUsername(), user.getEmail(), user.getRole());
    }
}
