package org.example.comprova.service;

import lombok.RequiredArgsConstructor;
import org.example.comprova.dto.QuestionDTO;
import org.example.comprova.exceptions.BusinessException;
import org.example.comprova.model.JobPosting;
import org.example.comprova.model.Question;
import org.example.comprova.repository.JobPostingRepository;
import org.example.comprova.repository.QuestionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final JobPostingRepository jobPostingRepository;

    public void saveQuestions(Long jobPostingId, List<QuestionDTO> questionDTOs) {

        JobPosting jobPosting = jobPostingRepository.findById(jobPostingId)
                .orElseThrow(() -> new BusinessException(
                        HttpStatus.NOT_FOUND,
                        "Job posting not found."
                ));

        List<Question> questions = questionDTOs.stream()
                .map(dto -> {
                    Question question = new Question();

                    question.setJobPosting(jobPosting);
                    question.setStatement(dto.statement());
                    question.setType(dto.type());
                    question.setSkillEvaluated(dto.skillEvaluated());
                    question.setEstimatedTimeMinutes(dto.estimatedTimeMinutes());
                    question.setExpectedAnswer(dto.expectedAnswer());
                    question.setCodeSnippet(dto.codeSnippet());
                    question.setEvaluationCriteria(dto.evaluationCriteria());

                    return question;
                })
                .toList();
        questionRepository.saveAll(questions);
    }
}