package org.example.comprova.service;

import lombok.RequiredArgsConstructor;
import org.example.comprova.dto.CompanyProfileDTO;
import org.example.comprova.dto.UpdateCompanyProfileDTO;
import org.example.comprova.exceptions.BusinessException;
import org.example.comprova.model.Company;
import org.example.comprova.repository.CompanyRepository;
import org.example.comprova.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CompanyProfileService {
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public CompanyProfileDTO getProfile(Company authenticatedCompany) {
        return toDTO(findCompany(authenticatedCompany));
    }

    @Transactional
    public CompanyProfileDTO updateProfile(Company authenticatedCompany, UpdateCompanyProfileDTO dto) {
        Company company = findCompany(authenticatedCompany);

        if (!company.getEmail().equalsIgnoreCase(dto.email()) && userRepository.existsByEmail(dto.email())) {
            throw new BusinessException(HttpStatus.CONFLICT, "Email address is already in use.");
        }

        boolean wantsNewPassword = dto.newPassword() != null && !dto.newPassword().isBlank();
        if (wantsNewPassword) {
            if (dto.currentPassword() == null || !passwordEncoder.matches(dto.currentPassword(), company.getPassword())) {
                throw new BusinessException(HttpStatus.BAD_REQUEST, "Current password is incorrect.");
            }
            company.setPassword(passwordEncoder.encode(dto.newPassword()));
        }

        company.setLegalName(dto.legalName());
        company.setTradeName(dto.tradeName());
        company.setEmail(dto.email());
        company.setPhone(dto.phone());

        return toDTO(companyRepository.save(company));
    }

    private Company findCompany(Company authenticatedCompany) {
        return companyRepository.findById(authenticatedCompany.getId())
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Company not found."));
    }

    private static CompanyProfileDTO toDTO(Company company) {
        return new CompanyProfileDTO(
                company.getLegalName(),
                company.getTradeName(),
                company.getCnpj(),
                company.getEmail(),
                company.getPhone()
        );
    }
}
