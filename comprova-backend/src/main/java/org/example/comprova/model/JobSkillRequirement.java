package org.example.comprova.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "job_skill_requirements")
@Getter
@Setter
@NoArgsConstructor
public class JobSkillRequirement {
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

    public JobSkillRequirement(JobPosting jobPosting, Skill skill, Integer weight) {
        this.jobPosting = jobPosting;
        this.skill = skill;
        this.weight = weight;
    }
}