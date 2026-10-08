package org.example.comprova.repository;

import org.example.comprova.model.Answer;
import org.example.comprova.model.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, Long> {
    List<Answer> findAllByJobApplication(JobApplication jobApplication);
}
