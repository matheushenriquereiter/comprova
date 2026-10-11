package org.example.comprova.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.comprova.enums.ApplicationStatus;
import org.example.comprova.model.Answer;
import org.example.comprova.model.JobApplication;
import org.example.comprova.repository.AnswerRepository;
import org.example.comprova.repository.JobApplicationRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiEvaluationService {

    private final JobApplicationRepository jobApplicationRepository;
    private final AnswerRepository answerRepository;
    private final ChatClient.Builder chatClientBuilder;

    private static final Pattern SCORE_PATTERN = Pattern.compile("\\b(100|[1-9]?[0-9])\\b");

    public int evaluateApplicationTestSync(JobApplication application) {
        List<Answer> answers = answerRepository.findAllByJobApplication(application);
        int totalQuestions = (application.getJobPosting() != null && application.getJobPosting().getQuestions() != null)
                ? application.getJobPosting().getQuestions().size()
                : answers.size();

        if (answers.isEmpty() || totalQuestions == 0) {
            application.setScore(0);
            application.setStatus(ApplicationStatus.FAILED);
            jobApplicationRepository.save(application);
            return 0;
        }

        int totalScore = 0;

        ChatClient chatClient = null;
        try {
            chatClient = chatClientBuilder.build();
        } catch (Exception e) {
            log.warn("Could not build ChatClient: {}", e.getMessage());
        }

        for (Answer answer : answers) {
            String candidateResponse = answer.getResponseText() != null ? answer.getResponseText().trim() : "";
            
            // Blank / empty answers get 0
            if (candidateResponse.isEmpty()) {
                answer.setScore(0);
                answerRepository.save(answer);
                continue;
            }

            int score = -1;

            if (chatClient != null) {
                try {
                    List<String> criteria = (answer.getQuestion() != null) ? answer.getQuestion().getEvaluationCriteria() : null;
                    String criteriaStr = (criteria != null && !criteria.isEmpty()) ? String.join(", ", criteria) : "Coerência, lógica técnica e clareza";
                    String expected = (answer.getQuestion() != null && answer.getQuestion().getExpectedAnswer() != null)
                            ? answer.getQuestion().getExpectedAnswer()
                            : "N/A";

                    String promptText = String.format(
                            "You are a strict technical evaluator for a job hiring test.\n" +
                            "Evaluate the candidate's answer to the technical question below and assign a score from 0 to 100 based strictly on accuracy, correctness, and technical depth.\n" +
                            "- If the answer is completely incorrect, nonsense, empty, or fails to address the question, assign a score of 0.\n" +
                            "- If the answer is partially correct, assign between 20 and 60 depending on correctness.\n" +
                            "- If the answer is fully correct and explains the concept well, assign between 80 and 100.\n" +
                            "You must output ONLY a single integer score between 0 and 100. Absolutely no other words or symbols.\n\n" +
                            "Question: %s\n" +
                            "Expected Reference Answer: %s\n" +
                            "Candidate's Answer: %s\n" +
                            "Evaluation Criteria: %s",
                            answer.getQuestion() != null ? answer.getQuestion().getStatement() : "N/A",
                            expected,
                            candidateResponse,
                            criteriaStr
                    );

                    String response = chatClient.prompt().user(promptText).call().content();
                    score = parseScore(response);
                    log.info("AI evaluation for question {}: parsed score={}", 
                            answer.getQuestion() != null ? answer.getQuestion().getId() : "null", score);
                } catch (Exception e) {
                    log.warn("ChatClient evaluation error for answer {}: {}", answer.getId(), e.getMessage());
                }
            }

            // If AI is unavailable or failed to return a valid score, calculate heuristic fallback score
            if (score < 0) {
                score = calculateFallbackScore(answer);
                log.info("Applied heuristic fallback score {} for answer {}", score, answer.getId());
            }

            answer.setScore(score);
            totalScore += score;
            answerRepository.save(answer);
        }

        // The final score MUST be divided by the total number of questions in the job posting
        int finalScore = totalQuestions > 0 ? (totalScore / totalQuestions) : 0;
        application.setScore(finalScore);
        // Automatically determine PASSED or FAILED so application never stays in EVALUATING indefinitely
        application.setStatus(finalScore >= 60 ? ApplicationStatus.PASSED : ApplicationStatus.FAILED);
        jobApplicationRepository.save(application);
        log.info("Application {} evaluated successfully: totalScore={}, totalQuestions={}, finalScore={}, status={}", 
                application.getId(), totalScore, totalQuestions, finalScore, application.getStatus());
        return finalScore;
    }

    private int parseScore(String response) {
        if (response == null || response.isBlank()) {
            return -1;
        }
        Matcher matcher = SCORE_PATTERN.matcher(response.trim());
        if (matcher.find()) {
            try {
                int val = Integer.parseInt(matcher.group(1));
                if (val >= 0 && val <= 100) {
                    return val;
                }
            } catch (NumberFormatException ignored) {}
        }
        return -1;
    }

    private int calculateFallbackScore(Answer answer) {
        String text = answer.getResponseText();
        if (text == null || text.trim().isEmpty()) {
            return 0;
        }
        String trimmed = text.trim();
        String lower = trimmed.toLowerCase();

        // Non-answers or common placeholders
        if (lower.equals("não sei") || lower.equals("nao sei") || lower.equals("n sei") 
                || lower.equals("sei não") || lower.equals("sei nao") || lower.equals("nao") 
                || lower.equals("não") || lower.equals("n/a") || lower.equals("teste")
                || lower.equals("asdf") || lower.equals("123")) {
            return 0;
        }

        if (trimmed.length() < 10) {
            return 10;
        }

        // Check keyword overlap with question statement or expected answer if available
        int matchCount = 0;
        if (answer.getQuestion() != null) {
            String reference = (answer.getQuestion().getExpectedAnswer() != null) 
                    ? answer.getQuestion().getExpectedAnswer() 
                    : answer.getQuestion().getStatement();
            
            if (reference != null) {
                String[] words = reference.toLowerCase().replaceAll("[^a-zA-Z0-9áéíóúâêîôûãõç ]", "").split("\\s+");
                for (String word : words) {
                    if (word.length() > 4 && lower.contains(word)) {
                        matchCount++;
                    }
                }
            }
        }

        if (matchCount == 0 && trimmed.length() < 30) {
            return 20;
        } else if (matchCount == 0) {
            return 35;
        } else if (matchCount <= 2) {
            return 60;
        } else if (matchCount <= 5) {
            return 75;
        } else {
            return 85;
        }
    }
}
