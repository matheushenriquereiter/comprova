package org.example.comprova.controller;

import jakarta.validation.Valid;
import org.example.comprova.dto.JobSkillRequirementDTO;
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
    public ResponseEntity<List<QuestionDTO>> generateQuestion(@Valid @RequestBody List<JobSkillRequirementDTO> jobSkillRequirements) {
        String jobRequirements = jobSkillRequirements.stream()
                .map(dto -> "Skill %s - Weight: %d".formatted(dto.name(), dto.weight()))
                .collect(Collectors.joining("\n"));

        List<QuestionDTO> questions = chatClient.prompt()
                .user(
                        u -> u.text("""
                        Generate 5 Java programming questions.
                        Return ONLY raw, valid JSON. Do not include markdown formatting or introductory text.
                        In Brazilian Portuguese.
                        Specify question type as PRACTICAL or THEORETICAL.
                        Create the test based on the required skills and their weights.
                        The higher the weight, the more questions for that skill there should be.
                        {requirements}
                      """).param("requirements", jobRequirements)
                )
                .call()
                .entity(new ParameterizedTypeReference<>() {});

        return ResponseEntity.ok(questions);
    }
}