package com.policyai.controller;

import com.policyai.dto.ChatRequest;
import com.policyai.dto.ChatResponse;
import com.policyai.service.ChatService;
import com.policyai.service.GeminiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final ChatService chatService;
    private final GeminiService geminiService;

    /**
     * Ask a question about policy documents.
     * POST /api/chat/ask
     */
    @PostMapping("/ask")
    public ResponseEntity<ChatResponse> askQuestion(@Valid @RequestBody ChatRequest request) {
        log.info("Chat request: question='{}', documentId={}", request.getQuestion(), request.getDocumentId());

        ChatResponse response = chatService.askQuestion(
                request.getQuestion(),
                request.getDocumentId()
        );

        return ResponseEntity.ok(response);
    }

    /**
     * Stream a question about policy documents.
     * POST /api/chat/stream
     */
    @PostMapping(value = "/stream", produces = org.springframework.http.MediaType.TEXT_EVENT_STREAM_VALUE)
    public org.springframework.web.servlet.mvc.method.annotation.SseEmitter streamQuestion(@Valid @RequestBody ChatRequest request) {
        return chatService.streamQuestion(request.getQuestion(), request.getDocumentId());
    }

    /**
     * Get chat history for a specific document.
     * GET /api/chat/history/{documentId}
     */
    @GetMapping("/history/{documentId}")
    public ResponseEntity<List<ChatResponse>> getChatHistory(@PathVariable Long documentId) {
        return ResponseEntity.ok(chatService.getChatHistory(documentId));
    }

    /**
     * Get global chat history (no specific document).
     * GET /api/chat/history
     */
    @GetMapping("/history")
    public ResponseEntity<List<ChatResponse>> getGlobalChatHistory() {
        return ResponseEntity.ok(chatService.getChatHistory(null));
    }

    /**
     * Clear chat history for a specific document or global.
     * DELETE /api/chat/history/{documentId}
     */
    @DeleteMapping(value = {"/history/{documentId}", "/history"})
    public ResponseEntity<Void> clearChatHistory(@PathVariable(required = false) Long documentId) {
        chatService.clearChatHistory(documentId);
        return ResponseEntity.ok().build();
    }

    /**
     * Check AI service status.
     * GET /api/chat/status
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getAIStatus() {
        boolean available = geminiService.isAvailable();
        return ResponseEntity.ok(Map.of(
                "geminiAvailable", available,
                "status", available ? "ready" : "unavailable",
                "message", available
                        ? "Gemini AI service is ready for questions"
                        : "Gemini API key is not configured. Please set GEMINI_API_KEY environment variable."
        ));
    }
}
