package org.example.comprova.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "job_posting_skills")
@Getter
@Setter
@NoArgsConstructor
public class JobPostingSkill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_posting_id", nullable = false)
    private JobPosting jobPosting;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Column(nullable = false)
    private Integer weight;
}