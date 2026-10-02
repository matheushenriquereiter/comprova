package org.example.comprova.controller;

import jakarta.validation.Valid;
import org.example.comprova.dto.QuestionGenerationRequestDTO;
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

    public QuestionGeneratorController(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    @PostMapping("/generate-question")
    public ResponseEntity<List<QuestionDTO>> generateQuestion(
            @Valid @RequestBody QuestionGenerationRequestDTO request) {
        String jobRequirements = request.skills().stream()
                .map(dto -> "Skill %s - Weight: %d".formatted(dto.name(), dto.weight()))
                .collect(Collectors.joining("\n"));

        List<QuestionDTO> questions = chatClient.prompt()
                .user(
                        u -> u.text("""
        Generate exactly 5 Java programming questions.
        The response must contain exactly 5 questions.

        Return ONLY raw, valid JSON.
        Do not include markdown formatting or introductory text.
        Write all questions in Brazilian Portuguese.

        Use only the question types PRACTICAL and THEORETICAL.
        Include both types in the test, with at least one question of each type.

        Consider the manager's description when creating the questions:
        {description}

        Create the questions based on the required skills and their weights.
        Skills with higher weights should have greater representation in the test.

        Required skills:
        {requirements}
        """)
                                .param("description", request.description())
                                .param("requirements", jobRequirements)
                )
                .call()
                .entity(new ParameterizedTypeReference<>() {});

        return ResponseEntity.ok(questions);
    }
}