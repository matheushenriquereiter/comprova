package org.example.comprova.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.comprova.enums.TestAttemptStatus;

import java.time.LocalDateTime;

@Entity
@Table(name = "test_attempts")
@Getter
@Setter
@NoArgsConstructor
public class TestAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_application_id", nullable = false)
    private JobApplication jobApplication;

    @Column(nullable = false)
    private LocalDateTime startedAt;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TestAttemptStatus status;

    private LocalDateTime finishedAt;
}