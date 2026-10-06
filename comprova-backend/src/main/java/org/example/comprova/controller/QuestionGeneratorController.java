package org.example.comprova.controller;

import jakarta.validation.Valid;
import org.example.comprova.dto.GenerateQuestionsDTO;
import org.example.comprova.dto.QuestionDTO;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.core.ParameterizedTypeReference;
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
            You are an expert IT recruiter and Senior Software Engineer creating a technical assessment.
            
            Generate exactly 5 open-ended programming questions in Brazilian Portuguese.
            
            Context for generation:
            - Manager's description: {description}
            - Required skills and weights (allocate more questions to higher weighted skills): {requirements}
            
            Question Type Requirements:
            1. PRACTICAL: The candidate must write code, fix a bug, complete an implementation, or design a solution.
            2. THEORETICAL: The candidate must explain a concept, compare architectural approaches, or justify a decision.
            
            Data Field Instructions & Constraints:
            - statement: The main text of the question instructing the candidate on what to write or code.
            - skillEvaluated: Must be one of the exact skills listed in the requirements.
            - estimatedTimeMinutes: Provide a realistic integer between 5 and 45 representing how long the candidate needs to complete it.
            - expectedAnswer: The ideal complete answer, explanation, or target code solution.
            - codeSnippet: You MUST provide a code snippet for every question. For practical questions, provide starter code or buggy code to fix. For theoretical questions, provide a code example that illustrates the concept they need to explain. Do NOT leave this blank or use "N/A".
            - evaluationCriteria: Provide 3 to 5 objective, bulleted points that a reviewer should look for to grade the answer.
            
            Format Requirements:
            - All questions must be open-ended (essay or code submission). Do NOT generate multiple-choice options.
            - Generate all content (except code syntax) strictly in Brazilian Portuguese (pt-BR).
            """;

    public QuestionGeneratorController(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    @PostMapping("/generate-questions")
    public ResponseEntity<List<QuestionDTO>> generateQuestion(
            @Valid @RequestBody GenerateQuestionsDTO generateQuestionsDTO) {

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