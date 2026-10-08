package org.example.comprova.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.example.comprova.enums.EmploymentType;
import org.example.comprova.enums.WorkplaceType;
import org.example.comprova.enums.JobPostingStatus;

public record UpdateJobPostingDTO(
        @NotBlank(message = "Job title cannot be null or empty.")
        @Size(min = 5, max = 100, message = "Job title must be between 5 and 100 characters.")
        String title,

        @NotBlank(message = "Job description cannot be null or empty.")
        @Size(min = 10, max = 5000, message = "Job description must be between 10 and 5000 characters.")
        String description,

        @NotNull(message = "Workplace type cannot be null.")
        WorkplaceType workplaceType,

        @NotNull(message = "Employment type cannot be null.")
        EmploymentType employmentType,

        @NotBlank(message = "Location cannot be null or empty.")
        @Size(min = 2, max = 100, message = "Location must be between 2 and 100 characters.")
        String location,

        @NotNull(message = "Status cannot be null.")
        JobPostingStatus status
) {
}
