package org.example.comprova.repository;

import org.example.comprova.model.Question;
import org.example.comprova.model.TestAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {

    List<Question> findByJobPostingId(Long jobPostingId);

    List<Question> findByTestAttempt(TestAttempt testAttempt);
}