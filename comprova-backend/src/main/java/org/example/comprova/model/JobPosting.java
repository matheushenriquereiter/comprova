package org.example.comprova.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.comprova.enums.EmploymentType;
import org.example.comprova.enums.JobPostingStatus;
import org.example.comprova.enums.WorkplaceType;
import org.example.comprova.exceptions.BusinessException;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "job_postings")
@Getter
@Setter
@NoArgsConstructor
public class JobPosting {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "job_seq_gen")
    @SequenceGenerator(name = "job_seq_gen", sequenceName = "job_seq", allocationSize = 1)
    private Long id;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, length = 5000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "workplace_type", nullable = false)
    private WorkplaceType workplaceType;

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_type", nullable = false)
    private EmploymentType employmentType;

    @Column(nullable = false, length = 100)
    private String location;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JobPostingStatus status = JobPostingStatus.DRAFT;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "expires_at", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime expiresAt;

    @OneToMany(mappedBy = "jobPosting", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<JobSkillRequirement> skills = new HashSet<>();

    @OneToMany(mappedBy = "jobPosting", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<JobApplication> jobApplications = new HashSet<>();

    public JobPosting(String title, String description, WorkplaceType workplaceType, EmploymentType employmentType, String location, Company company, LocalDateTime expiresAt) {
        this.title = title;
        this.description = description;
        this.workplaceType = workplaceType;
        this.employmentType = employmentType;
        this.location = location;
        this.company = company;
        this.expiresAt = expiresAt;
    }

    public void addApplication(JobApplication jobApplication) {
        if (jobApplication == null) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "Job application cannot be null.");
        }

        jobApplication.setJobPosting(this);
        this.jobApplications.add(jobApplication);
    }
}
