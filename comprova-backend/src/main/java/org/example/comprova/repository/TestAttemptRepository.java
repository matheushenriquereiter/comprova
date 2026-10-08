package org.example.comprova.repository;

import org.example.comprova.model.JobApplication;
import org.example.comprova.model.TestAttempt;
import org.example.comprova.enums.TestAttemptStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TestAttemptRepository extends JpaRepository<TestAttempt, Long> {

    Optional<TestAttempt> findByJobApplicationAndStatus(
            JobApplication jobApplication,
            TestAttemptStatus status
    );
}