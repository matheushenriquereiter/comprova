package org.example.comprova.service;

import lombok.RequiredArgsConstructor;
import org.example.comprova.dto.GenerateQuestionsDTO;
import org.example.comprova.dto.JobSkillRequirementDTO;
import org.example.comprova.dto.QuestionDTO;
import org.example.comprova.exceptions.BusinessException;
import org.example.comprova.model.Company;
import org.example.comprova.model.JobPosting;
import org.example.comprova.model.Question;
import org.example.comprova.model.TestAttempt;
import org.example.comprova.repository.JobPostingRepository;
import org.example.comprova.repository.QuestionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final JobPostingRepository jobPostingRepository;

    @Transactional(readOnly = true)
    public GenerateQuestionsDTO getQuestionGenerationData(
            Company company,
            Long jobPostingId
    ) {

        JobPosting jobPosting = jobPostingRepository.findById(jobPostingId)
                .orElseThrow(() -> new BusinessException(
                        HttpStatus.NOT_FOUND,
                        "Job posting not found."
                ));

        if (!jobPosting.getCompany().getId().equals(company.getId())) {
            throw new BusinessException(
                    HttpStatus.FORBIDDEN,
                    "You do not have permission to generate questions for this job posting."
            );
        }

        return new GenerateQuestionsDTO(
                jobPosting.getDescription(),
                jobPosting.getSkills().stream()
                        .map(skillRequirement -> new JobSkillRequirementDTO(
                                skillRequirement.getSkill().getName(),
                                skillRequirement.getWeight()
                        ))
                        .toList()
        );
    }

    @Transactional
    public void saveQuestions(
            Long jobPostingId,
            List<QuestionDTO> questionDTOs
    ) {

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

    @Transactional
    public List<Question> saveQuestionsForAttempt(
            TestAttempt testAttempt,
            List<QuestionDTO> questionDTOs
    ) {

        JobPosting jobPosting =
                testAttempt.getJobApplication().getJobPosting();

        List<Question> questions = questionDTOs.stream()
                .map(dto -> {
                    Question question = new Question();

                    question.setJobPosting(jobPosting);
                    question.setTestAttempt(testAttempt);
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

        return questionRepository.saveAll(questions);
    }

    @Transactional(readOnly = true)
    public List<Question> getQuestionsByAttempt(TestAttempt testAttempt) {
        return questionRepository.findByTestAttempt(testAttempt);
    }

    @Transactional(readOnly = true)
    public GenerateQuestionsDTO getQuestionGenerationDataForAttempt(
            TestAttempt testAttempt
    ) {

        JobPosting jobPosting =
                testAttempt.getJobApplication().getJobPosting();

        return new GenerateQuestionsDTO(
                jobPosting.getDescription(),
                jobPosting.getSkills().stream()
                        .map(skillRequirement -> new JobSkillRequirementDTO(
                                skillRequirement.getSkill().getName(),
                                skillRequirement.getWeight()
                        ))
                        .toList()
        );
    }
}