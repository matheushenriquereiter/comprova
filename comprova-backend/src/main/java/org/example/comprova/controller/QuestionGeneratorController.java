package org.example.comprova.controller;

import jakarta.validation.Valid;
import org.example.comprova.dto.GenerateQuestionsDTO;
import org.example.comprova.dto.JobSkillRequirementDTO;
import org.example.comprova.dto.QuestionDTO;
import org.example.comprova.exceptions.BusinessException;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
public class QuestionGeneratorController {
    private final ChatClient chatClient;
    private static final String PROMPT = """
            Senior Software Engineer assessment generator.
            Generate exactly 5 open-ended technical questions in Brazilian Portuguese (pt-BR).
            
            Context:
            - Role description: {description}
            - Required skills and weights: {requirements}
            
            Question Types:
            - PRACTICAL: Candidate writes code, fixes a bug, or completes an implementation.
            - THEORETICAL: Candidate explains concepts, architecture, or design tradeoffs.
            
            Fields:
            - statement: Question prompt instructing candidate in pt-BR.
            - skillEvaluated: Exact skill name from requirements.
            - estimatedTimeMinutes: Realistic completion time (5-45).
            - expectedAnswer: Target benchmark solution/code in pt-BR.
            - codeSnippet: Starter/buggy code (practical) or illustrative snippet (theoretical).
            - evaluationCriteria: 3-5 objective checkable grading criteria in pt-BR (e.g. edge cases, Big-O, key distinctions).
            
            Rules:
            - Open-ended only, no multiple-choice.
            - Generate all content (except code syntax) strictly in Brazilian Portuguese (pt-BR).
            """;

    public QuestionGeneratorController(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    @PostMapping("/company/generate-questions")
    public ResponseEntity<List<QuestionDTO>> generateQuestion(
            @Valid @RequestBody GenerateQuestionsDTO generateQuestionsDTO) {

        int weightSum = generateQuestionsDTO.skills().stream()
                .mapToInt(JobSkillRequirementDTO::weight)
                .sum();
        if (weightSum != 100) {
            throw new BusinessException(
                    HttpStatus.BAD_REQUEST,
                    String.format("The sum of skill weights must be exactly 100, but was %d.", weightSum)
            );
        }

        String jobRequirements = generateQuestionsDTO.skills().stream()
                .map(dto -> "Skill %s - Weight: %d".formatted(dto.name(), dto.weight()))
                .collect(Collectors.joining("\n"));

        List<QuestionDTO> questions = chatClient.prompt()
                .user(u -> u.text(PROMPT)
                        .param("description", generateQuestionsDTO.description())
                        .param("requirements", jobRequirements)
                )
                .call().entity(new ParameterizedTypeReference<>() {
                });

        return ResponseEntity.ok(questions);
    }
}