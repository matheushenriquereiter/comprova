package org.example.comprova.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.comprova.enums.ApplicationStatus;
import org.example.comprova.model.*;
import org.example.comprova.repository.AnswerRepository;
import org.example.comprova.repository.CandidateSkillRepository;
import org.example.comprova.repository.JobApplicationRepository;
import org.example.comprova.repository.SkillRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiEvaluationService {
    private final JobApplicationRepository jobApplicationRepository;
    private final AnswerRepository answerRepository;
    private final CandidateSkillRepository candidateSkillRepository;
    private final SkillRepository skillRepository;
    private final ChatClient.Builder chatClientBuilder;
    private final ObjectMapper objectMapper;

    private static final Pattern SCORE_PATTERN = Pattern.compile("\"totalScore\"\\s*:\\s*(\\d+)");
    private static final Pattern FALLBACK_INT_PATTERN = Pattern.compile("\\b(100|[1-9]?[0-9])\\b");

    @Transactional
    public int evaluateApplicationTestSync(JobApplication application) {
        List<Answer> answers = answerRepository.findAllByJobApplication(application);
        int totalQuestions = (application.getJobPosting() != null && application.getJobPosting().getQuestions() != null)
                ? application.getJobPosting().getQuestions().size()
                : answers.size();

        if (answers.isEmpty() || totalQuestions == 0) {
            application.setScore(0);
            application.setStatus(ApplicationStatus.TEST_COMPLETED);
            jobApplicationRepository.save(application);
            return 0;
        }

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
                answer.setFeedback("Questão deixada em branco pelo candidato.");
                answerRepository.save(answer);
                continue;
            }

            int score = -1;
            String feedback = "";

            if (chatClient != null) {
                try {
                    List<String> criteria = (answer.getQuestion() != null) ? answer.getQuestion().getEvaluationCriteria() : null;
                    String criteriaStr = (criteria != null && !criteria.isEmpty())
                            ? String.join("\n- ", criteria)
                            : "Lógica técnica, corretude e tratamento de erros";

                    String expected = (answer.getQuestion() != null && answer.getQuestion().getExpectedAnswer() != null)
                            ? answer.getQuestion().getExpectedAnswer()
                            : "N/A";

                    String statement = (answer.getQuestion() != null && answer.getQuestion().getStatement() != null)
                            ? answer.getQuestion().getStatement()
                            : "N/A";

                    String questionType = (answer.getQuestion() != null && answer.getQuestion().getType() != null)
                            ? answer.getQuestion().getType().name()
                            : "THEORETICAL";

                    String skill = (answer.getQuestion() != null && answer.getQuestion().getSkillEvaluated() != null)
                            ? answer.getQuestion().getSkillEvaluated()
                            : "Geral";

                    String codeSnippet = (answer.getQuestion() != null && answer.getQuestion().getCodeSnippet() != null)
                            ? answer.getQuestion().getCodeSnippet()
                            : "N/A";

                    String promptText = String.format("""
                                    Senior technical hiring evaluator. Assess candidate's answer with strict technical accuracy and objectivity.
                                    
                                    SCORING RUBRIC (Max 100 points):
                                    1. Correctness & Core Logic (0-50 pts):
                                       - Does the solution solve the core problem or explain the concept accurately?
                                       - Fatal syntax/runtime bugs, completely incorrect or nonsense: 0-15 pts.
                                       - Partially correct logic with minor flaws: 20-35 pts.
                                       - Fully correct, sound, and accurate: 40-50 pts.
                                    2. Specific Criteria Compliance (0-30 pts):
                                       - Evaluate against the specific criteria listed below.
                                       - Award points proportionally per criterion met. If none met: 0 pts.
                                    3. Best Practices & Edge Cases (0-20 pts):
                                       - Edge cases (null, empty, bounds), code quality, efficiency (Big-O), clarity.
                                       - No handling: 0-5 pts. Good: 6-14 pts. Exemplary: 15-20 pts.
                                    
                                    RULES:
                                    - Empty, evasive, 'don't know', filler, or off-topic answers MUST receive totalScore = 0.
                                    - totalScore MUST be EXACT sum: correctnessScore + criteriaScore + bestPracticesScore.
                                    - Return ONLY valid JSON matching this schema:
                                    {
                                      "correctnessScore": <int 0-50>,
                                      "criteriaScore": <int 0-30>,
                                      "bestPracticesScore": <int 0-20>,
                                      "totalScore": <int 0-100>,
                                      "feedback": "<concise 2-3 sentence explanation in Brazilian Portuguese (pt-BR) justifying the grade>",
                                      "strengths": ["<strength in pt-BR>"],
                                      "improvements": ["<improvement in pt-BR>"]
                                    }
                                    
                                    QUESTION:
                                    - Statement: %s
                                    - Type: %s
                                    - Skill: %s
                                    - Code Snippet: %s
                                    - Reference Solution: %s
                                    - Specific Criteria:
                                    - %s
                                    
                                    CANDIDATE ANSWER:
                                    \"""
                                    %s
                                    \"""
                                    """,
                            statement,
                            questionType,
                            skill,
                            codeSnippet,
                            expected,
                            criteriaStr,
                            candidateResponse
                    );

                    String response = chatClient.prompt().user(promptText).call().content();
                    EvaluationParsed parsed = parseEvaluationResponse(response);
                    if (parsed != null && parsed.score >= 0) {
                        score = parsed.score;
                        feedback = parsed.feedback;
                        log.info("AI evaluation for question {}: parsed score={}, feedback={}",
                                answer.getQuestion() != null ? answer.getQuestion().getId() : "null", score, feedback);
                    }
                } catch (Exception e) {
                    log.warn("ChatClient evaluation error for answer {}: {}", answer.getId(), e.getMessage());
                }
            }

            // Fallback heuristic if AI call failed
            if (score < 0) {
                score = calculateFallbackScore(answer);
                feedback = "Avaliação preliminar automática (análise detalhada por IA temporariamente indisponível).";
                log.info("Applied fallback score {} for answer {}", score, answer.getId());
            }

            answer.setScore(score);
            answer.setFeedback(feedback);
            answerRepository.save(answer);
        }

        // Calculate skill-weighted final score
        int finalScore = calculateWeightedFinalScore(application, answers, totalQuestions);

        application.setScore(finalScore);
        application.setStatus(ApplicationStatus.TEST_COMPLETED);
        jobApplicationRepository.save(application);

        updateCandidateSkillsScores(application.getCandidate(), answers);

        log.info("Application {} evaluated successfully: finalScore={}, status={}",
                application.getId(), finalScore, application.getStatus());

        return finalScore;
    }

    private void updateCandidateSkillsScores(Candidate candidate, List<Answer> answers) {
        if (candidate == null || answers == null || answers.isEmpty()) {
            return;
        }

        try {
            Map<String, List<Answer>> bySkill = answers.stream()
                    .filter(a -> a.getQuestion() != null && a.getQuestion().getSkillEvaluated() != null)
                    .collect(Collectors.groupingBy(a -> a.getQuestion().getSkillEvaluated().trim().toLowerCase()));

            for (Map.Entry<String, List<Answer>> entry : bySkill.entrySet()) {
                String skillName = entry.getKey();
                List<Answer> skillAnswers = entry.getValue();
                if (skillAnswers.isEmpty()) continue;

                double avgScore = skillAnswers.stream()
                        .mapToInt(a -> a.getScore() != null ? a.getScore() : 0)
                        .average()
                        .orElse(0.0);
                int roundedScore = (int) Math.round(avgScore);

                skillRepository.findByNameIgnoreCase(skillName).ifPresent(skill -> {
                    Optional<CandidateSkill> optCandidateSkill = candidateSkillRepository.findByCandidateAndSkill(candidate, skill);
                    if (optCandidateSkill.isPresent()) {
                        CandidateSkill cs = optCandidateSkill.get();
                        int bestScore = cs.getValidatedScore() != null ? Math.max(cs.getValidatedScore(), roundedScore) : roundedScore;
                        cs.setValidatedScore(bestScore);
                        cs.setValidatedAt(java.time.LocalDateTime.now());
                        candidateSkillRepository.save(cs);
                    } else {
                        CandidateSkill cs = new CandidateSkill(candidate, skill, org.example.comprova.enums.SkillLevel.INTERMEDIATE);
                        cs.setValidatedScore(roundedScore);
                        cs.setValidatedAt(java.time.LocalDateTime.now());
                        candidateSkillRepository.save(cs);
                    }
                });
            }
        } catch (Exception e) {
            log.warn("Could not update candidate validated skills: {}", e.getMessage());
        }
    }

    private int calculateWeightedFinalScore(JobApplication application, List<Answer> answers, int totalQuestions) {
        if (answers.isEmpty() || totalQuestions == 0) {
            return 0;
        }

        Set<JobSkillRequirement> skillRequirements = (application.getJobPosting() != null && application.getJobPosting().getSkills() != null)
                ? application.getJobPosting().getSkills()
                : Collections.emptySet();

        // Count how many questions exist for each skill to distribute skill weights fairly
        Map<String, Long> questionsPerSkill = answers.stream()
                .filter(a -> a.getQuestion() != null && a.getQuestion().getSkillEvaluated() != null)
                .collect(Collectors.groupingBy(
                        a -> a.getQuestion().getSkillEvaluated().trim().toLowerCase(),
                        Collectors.counting()
                ));

        double weightedScoreSum = 0.0;
        double totalWeightSum = 0.0;

        for (Answer answer : answers) {
            double qWeight = 1.0;
            if (answer.getQuestion() != null && answer.getQuestion().getSkillEvaluated() != null) {
                String skillName = answer.getQuestion().getSkillEvaluated().trim().toLowerCase();
                Optional<JobSkillRequirement> matchingReq = skillRequirements.stream()
                        .filter(r -> r.getSkill() != null && r.getSkill().getName() != null && r.getSkill().getName().trim().equalsIgnoreCase(skillName))
                        .findFirst();

                if (matchingReq.isPresent()) {
                    long count = questionsPerSkill.getOrDefault(skillName, 1L);
                    qWeight = (double) matchingReq.get().getWeight() / (count > 0 ? count : 1);
                }
            }

            int answerScore = answer.getScore() != null ? answer.getScore() : 0;
            weightedScoreSum += (answerScore * qWeight);
            totalWeightSum += qWeight;
        }

        return totalWeightSum > 0 ? (int) Math.round(weightedScoreSum / totalWeightSum) : 0;
    }

    private EvaluationParsed parseEvaluationResponse(String response) {
        if (response == null || response.isBlank()) {
            return null;
        }

        String clean = response.trim();
        if (clean.startsWith("```json")) {
            clean = clean.substring(7);
        } else if (clean.startsWith("```")) {
            clean = clean.substring(3);
        }
        if (clean.endsWith("```")) {
            clean = clean.substring(0, clean.length() - 3);
        }
        clean = clean.trim();

        try {
            JsonNode root = objectMapper.readTree(clean);
            int correctness = root.has("correctnessScore") ? root.get("correctnessScore").asInt() : 0;
            int criteria = root.has("criteriaScore") ? root.get("criteriaScore").asInt() : 0;
            int bestPractices = root.has("bestPracticesScore") ? root.get("bestPracticesScore").asInt() : 0;
            int total = root.has("totalScore") ? root.get("totalScore").asInt() : (correctness + criteria + bestPractices);

            total = Math.max(0, Math.min(100, total));
            String feedback = root.has("feedback") ? root.get("feedback").asText() : "";

            return new EvaluationParsed(total, feedback);
        } catch (Exception e) {
            log.warn("Failed to parse JSON response from LLM: {}", e.getMessage());
        }

        // Regex fallback if JSON was slightly malformed
        Matcher m = SCORE_PATTERN.matcher(clean);
        if (m.find()) {
            try {
                int total = Integer.parseInt(m.group(1));
                return new EvaluationParsed(Math.max(0, Math.min(100, total)), "Avaliação concluída pela IA.");
            } catch (NumberFormatException ignored) {
            }
        }

        Matcher intMatcher = FALLBACK_INT_PATTERN.matcher(clean);
        if (intMatcher.find()) {
            try {
                int total = Integer.parseInt(intMatcher.group(1));
                return new EvaluationParsed(Math.max(0, Math.min(100, total)), "Avaliação concluída pela IA.");
            } catch (NumberFormatException ignored) {
            }
        }

        return null;
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
            return 0;
        }

        // Conservative heuristic if AI failed: check technical keyword overlap
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

        if (matchCount == 0) {
            return 10;
        } else if (matchCount <= 2) {
            return 30;
        } else if (matchCount <= 4) {
            return 50;
        } else {
            return 65;
        }
    }

    private record EvaluationParsed(int score, String feedback) {
    }
}
