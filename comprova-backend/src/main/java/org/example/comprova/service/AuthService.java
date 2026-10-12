package org.example.comprova.service;

import lombok.RequiredArgsConstructor;
import org.example.comprova.dto.*;
import org.example.comprova.exceptions.BusinessException;
import org.example.comprova.model.Candidate;
import org.example.comprova.model.Company;
import org.example.comprova.model.User;
import org.example.comprova.repository.CandidateRepository;
import org.example.comprova.repository.CompanyRepository;
import org.example.comprova.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final CandidateRepository candidateRepository;
    private final JwtService jwtService;

    @Transactional
    public void signUpCandidate(CandidateRegisterDTO candidateRegisterDTO) {
        if (userRepository.existsByUsername(candidateRegisterDTO.username()))
            throw new BusinessException(HttpStatus.CONFLICT, "Username is already in use.");

        if (userRepository.existsByEmail(candidateRegisterDTO.email()))
            throw new BusinessException(HttpStatus.CONFLICT, "Email address is already in use.");

        if (candidateRepository.existsByCpf(candidateRegisterDTO.cpf())) {
            throw new BusinessException(HttpStatus.CONFLICT, "CPF is already in use.");
        }

        String encodedPassword = passwordEncoder.encode(candidateRegisterDTO.password());

        userRepository.save(new Candidate(
                candidateRegisterDTO.username(),
                candidateRegisterDTO.email(),
                encodedPassword,
                candidateRegisterDTO.cpf()
        ));
    }

    @Transactional
    public void signUpCompany(CompanyRegisterDTO companyRegisterDTO) {
        if (userRepository.existsByUsername(companyRegisterDTO.username()))
            throw new BusinessException(HttpStatus.CONFLICT, "Username is already in use.");

        if (userRepository.existsByEmail(companyRegisterDTO.email()))
            throw new BusinessException(HttpStatus.CONFLICT, "Email address is already in use.");

        if (companyRepository.existsByCnpj(companyRegisterDTO.cnpj())) {
            throw new BusinessException(HttpStatus.CONFLICT, "CNPJ is already in use.");
        }

        String encodedPassword = passwordEncoder.encode(companyRegisterDTO.password());

        userRepository.save(new Company(
                companyRegisterDTO.username(),
                companyRegisterDTO.email(),
                encodedPassword,
                companyRegisterDTO.legalName(),
                companyRegisterDTO.tradeName(),
                companyRegisterDTO.phone(),
                companyRegisterDTO.cnpj()
        ));
    }

    public TokenDTO signIn(UserLoginDTO userLoginDTO) {
        User user = userRepository.getUserByEmail(userLoginDTO.email())
                .orElseThrow(() -> new BusinessException(HttpStatus.BAD_REQUEST, "Invalid email or password."));

        if (!passwordEncoder.matches(userLoginDTO.password(), user.getPassword())) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "Invalid email or password.");
        }

        return new TokenDTO(jwtService.generateToken(user.getUsername()));
    }

    public UserResponseDTO me(String username) {
        User user = userRepository.getUserByUsername(username)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "User not found."));

        return new UserResponseDTO(user.getUsername(), user.getEmail(), user.getRole());
    }

    @Transactional(readOnly = true)
    public CandidateProfileResponseDTO getCandidateProfile(Candidate candidate) {
        Candidate persisted = candidateRepository.findById(candidate.getId())
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Candidate not found."));

        String cpf = persisted.getCpf();
        if (cpf != null && cpf.length() == 11) {
            cpf = cpf.replaceAll("(\\d{3})(\\d{3})(\\d{3})(\\d{2})", "$1.$2.$3-$4");
        }

        return new CandidateProfileResponseDTO(persisted.getUsername(), persisted.getEmail(), cpf);
    }

    @Transactional
    public ProfileUpdateResponseDTO updateCandidateProfile(Candidate candidate, UpdateCandidateProfileDTO dto) {
        Candidate persisted = candidateRepository.findById(candidate.getId())
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Candidate not found."));

        updateUsernameIfChanged(persisted, dto.username());
        updateEmailIfChanged(persisted, dto.email());
        changePasswordIfRequested(persisted, dto.currentPassword(), dto.newPassword());

        candidateRepository.save(persisted);

        return new ProfileUpdateResponseDTO(
                persisted.getUsername(),
                persisted.getEmail(),
                jwtService.generateToken(persisted.getUsername()),
                "Profile updated successfully."
        );
    }

    @Transactional(readOnly = true)
    public CompanyProfileResponseDTO getCompanyProfile(Company company) {
        Company persisted = companyRepository.findById(company.getId())
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Company not found."));

        return new CompanyProfileResponseDTO(
                persisted.getUsername(),
                persisted.getEmail(),
                persisted.getLegalName(),
                persisted.getTradeName(),
                persisted.getPhone(),
                persisted.getCnpj()
        );
    }

    @Transactional
    public ProfileUpdateResponseDTO updateCompanyProfile(Company company, UpdateCompanyProfileDTO dto) {
        Company persisted = companyRepository.findById(company.getId())
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Company not found."));

        updateEmailIfChanged(persisted, dto.email());
        persisted.setLegalName(dto.legalName());
        persisted.setTradeName(dto.tradeName());
        persisted.setPhone(dto.phone());
        changePasswordIfRequested(persisted, dto.currentPassword(), dto.newPassword());

        companyRepository.save(persisted);

        return new ProfileUpdateResponseDTO(
                persisted.getUsername(),
                persisted.getEmail(),
                jwtService.generateToken(persisted.getUsername()),
                "Profile updated successfully."
        );
    }

    private void updateUsernameIfChanged(User user, String newUsername) {
        if (user.getUsername().equalsIgnoreCase(newUsername)) {
            user.setUsername(newUsername);
            return;
        }

        if (userRepository.existsByUsername(newUsername)) {
            throw new BusinessException(HttpStatus.CONFLICT, "Username is already in use.");
        }

        user.setUsername(newUsername);
    }

    private void updateEmailIfChanged(User user, String newEmail) {
        if (user.getEmail().equalsIgnoreCase(newEmail)) {
            user.setEmail(newEmail);
            return;
        }

        if (userRepository.existsByEmail(newEmail)) {
            throw new BusinessException(HttpStatus.CONFLICT, "Email address is already in use.");
        }

        user.setEmail(newEmail);
    }

    private void changePasswordIfRequested(User user, String currentPassword, String newPassword) {
        if (newPassword == null || newPassword.isBlank()) {
            return;
        }

        if (currentPassword == null || currentPassword.isBlank()) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "Current password is required to change the password.");
        }

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "Current password is incorrect.");
        }

        if (currentPassword.equals(newPassword)) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "New password must be different from the current password.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
    }
}
