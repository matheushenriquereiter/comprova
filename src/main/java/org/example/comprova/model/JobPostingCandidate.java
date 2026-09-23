package org.example.comprova.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "job_posting_candidates")
@Getter
@Setter
@NoArgsConstructor
public class JobPostingCandidate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "job_posting_id", nullable = false)
    private JobPosting jobPosting;

    @ManyToOne
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;
}