package org.example.comprova.controller;

import jakarta.validation.Valid;
import org.example.comprova.dto.PromptDTO;
import org.example.comprova.dto.QuestionDTO;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class QuestionGeneratorController {
    private final ChatClient chatClient;

    public QuestionGeneratorController(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    @PostMapping("/generate-question")
    public ResponseEntity<List<QuestionDTO>> generateQuestion(@Valid @RequestBody PromptDTO promptDTO) {
        List<QuestionDTO> questions = chatClient.prompt()
                .user(
                        u -> u.text("""
                        Generate 5 Java programming questions.
                        Return ONLY raw, valid JSON. Do not include markdown formatting or introductory text.
                        In Brazilian Portuguese.
                        Specify question type as PRACTICAL or THEORETICAL.
                        Difficult: {difficult}
                      """).param("difficult", "Very Easy")
                )
                .call()
                .entity(new ParameterizedTypeReference<>() {});

        return ResponseEntity.ok(questions);
    }
}