package org.example.comprova.controller;

import jakarta.validation.Valid;
import org.example.comprova.dto.PromptDTO;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CodeGeneratorController {
    private final ChatClient chatClient;

    public CodeGeneratorController(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    @GetMapping("/generate-question")
    public ResponseEntity<String> generateQuestion(@Valid @RequestBody PromptDTO promptDTO) {

        return ResponseEntity.ok(
                chatClient
                .prompt()
                .user(promptDTO.prompt())
                .call()
                .content()
        );
    }
}