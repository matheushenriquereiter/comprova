package org.example.comprova.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.comprova.enums.JobPostingStatus;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
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

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JobPostingStatus status = JobPostingStatus.DRAFT;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "expires_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime expiresAt;

    @OneToMany(mappedBy = "jobPosting", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<JobPostingSkill> skills;

    @OneToMany(mappedBy = "jobPosting", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<JobPostingCandidate> candidates;

    public JobPosting(String title, Company company, LocalDateTime expiresAt) {
        this.title = title;
        this.company = company;
        this.expiresAt = expiresAt;
    }
}
