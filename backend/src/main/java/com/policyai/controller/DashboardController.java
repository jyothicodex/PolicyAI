package com.policyai.controller;

import com.policyai.repository.ChatMessageRepository;
import com.policyai.repository.DocumentRepository;
import com.policyai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DocumentRepository documentRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        long documentsUploaded = documentRepository.count();
        long questionsAnswered = chatMessageRepository.count() / 2; // Assuming 1 question = 1 user + 1 assistant msg
        long activeUsers = userRepository.count();
        
        // Assume every question answered saves 5 minutes
        long timeSavedMinutes = questionsAnswered * 5;
        String timeSaved;
        if (timeSavedMinutes < 60) {
            timeSaved = timeSavedMinutes + " mins";
        } else {
            timeSaved = (timeSavedMinutes / 60) + " hrs";
        }

        return ResponseEntity.ok(Map.of(
                "documentsUploaded", documentsUploaded,
                "questionsAnswered", questionsAnswered,
                "timeSaved", timeSaved,
                "activeUsers", activeUsers
        ));
    }
}
