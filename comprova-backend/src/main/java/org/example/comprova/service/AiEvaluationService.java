package org.example.comprova.service;

import lombok.RequiredArgsConstructor;
import org.example.comprova.model.Answer;
import org.example.comprova.model.JobApplication;
import org.example.comprova.repository.AnswerRepository;
import org.example.comprova.repository.JobApplicationRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AiEvaluationService {

    private final JobApplicationRepository jobApplicationRepository;
    private final AnswerRepository answerRepository;
    private final ChatClient.Builder chatClientBuilder;

    public int evaluateApplicationTestSync(JobApplication application) {
        List<Answer> answers = answerRepository.findAllByJobApplication(application);
        if (answers.isEmpty()) {
            application.setScore(0);
            jobApplicationRepository.save(application);
            return 0;
        }

        try {
            ChatClient chatClient = chatClientBuilder.build();
            int totalScore = 0;
            int evaluatedAnswers = 0;

            for (Answer answer : answers) {
                String promptText = String.format(
                        "You are an expert technical evaluator. " +
                        "Evaluate the following answer to a question and give it a score from 0 to 100 based strictly on its accuracy and logic. " +
                        "Only output a single integer representing the score. Nothing else.\n\n" +
                        "Question: %s\n" +
                        "Candidate's Answer: %s\n" +
                        "Evaluation Criteria: %s",
                        answer.getQuestion().getStatement(),
                        answer.getResponseText() == null ? "N/A" : answer.getResponseText(),
                        String.join(", ", answer.getQuestion().getEvaluationCriteria())
                );

                try {
                    String response = chatClient.prompt().user(promptText).call().content();
                    int score = Integer.parseInt(response.trim().replaceAll("[^0-9]", ""));
                    answer.setScore(score);
                    totalScore += score;
                    evaluatedAnswers++;
                } catch (Exception e) {
                    answer.setScore(0);
                }
                answerRepository.save(answer);
            }

            int finalScore = evaluatedAnswers > 0 ? (totalScore / evaluatedAnswers) : 0;
            application.setScore(finalScore);
            jobApplicationRepository.save(application);
            return finalScore;

        } catch (Exception e) {
            e.printStackTrace();
            application.setScore(0);
            jobApplicationRepository.save(application);
            return 0;
        }
    }
}
