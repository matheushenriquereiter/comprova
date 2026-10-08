package org.example.comprova.dto;

import org.example.comprova.enums.ApplicationStatus;
import org.example.comprova.enums.EmploymentType;

public record CandidateApplicationDTO(
        Long applicationId,
        Long jobPostingId,
        String title,
        String companyName,
        EmploymentType employmentType,
        String location,
        ApplicationStatus status,
        org.example.comprova.enums.JobPostingStatus jobPostingStatus,
        Integer score,
        String workplaceType,
        java.time.LocalDateTime createdAt
) {}
