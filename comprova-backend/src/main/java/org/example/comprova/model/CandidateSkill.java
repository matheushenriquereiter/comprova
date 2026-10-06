package org.example.comprova.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.comprova.enums.SkillLevel;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "candidate_skills",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_candidate_skill",
                        columnNames = {"candidate_id", "skill_id"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
public class CandidateSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Enumerated(EnumType.STRING)
    @Column(name = "declared_level", nullable = false)
    private SkillLevel declaredLevel;

    @Column(name = "validated_score")
    private Integer validatedScore;

    @Column(name = "validated_at")
    private LocalDateTime validatedAt;

    public CandidateSkill(
            Candidate candidate,
            Skill skill,
            SkillLevel declaredLevel
    ) {
        this.candidate = candidate;
        this.skill = skill;
        this.declaredLevel = declaredLevel;
    }
}