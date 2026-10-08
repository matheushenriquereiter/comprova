package org.example.comprova.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.comprova.enums.QuestionType;

import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "questions")
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String statement;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuestionType type;

    @Column(nullable = false)
    private String skillEvaluated;

    private Integer estimatedTimeMinutes;

    @Column(columnDefinition = "TEXT")
    private String expectedAnswer;

    @Column(columnDefinition = "TEXT")
    private String codeSnippet;

    @ElementCollection
    @CollectionTable(
            name = "question_evaluation_criteria",
            joinColumns = @JoinColumn(name = "question_id")
    )
    @Column(name = "criterion", nullable = false)
    private List<String> evaluationCriteria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_posting_id", nullable = false)
    private JobPosting jobPosting;

    public Question(
            String statement,
            QuestionType type,
            String skillEvaluated,
            Integer estimatedTimeMinutes,
            String expectedAnswer,
            String codeSnippet,
            List<String> evaluationCriteria
    ) {
        this.statement = statement;
        this.type = type;
        this.skillEvaluated = skillEvaluated;
        this.estimatedTimeMinutes = estimatedTimeMinutes;
        this.expectedAnswer = expectedAnswer;
        this.codeSnippet = codeSnippet;
        this.evaluationCriteria = evaluationCriteria;
    }
}