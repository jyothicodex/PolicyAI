package com.policyai.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class OllamaService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.ollama.base-url}")
    private String ollamaBaseUrl;

    @Value("${app.ollama.model}")
    private String ollamaModel;

    public OllamaService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Generate embeddings for a text chunk using nomic-embed-text.
     */
    public double[] getEmbedding(String text) {
        String url = ollamaBaseUrl + "/api/embeddings";
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "nomic-embed-text");
        requestBody.put("prompt", text);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.POST, request, String.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                JsonNode embeddingNode = jsonNode.path("embedding");
                if (embeddingNode.isArray()) {
                    double[] embedding = new double[embeddingNode.size()];
                    for (int i = 0; i < embeddingNode.size(); i++) {
                        embedding[i] = embeddingNode.get(i).asDouble();
                    }
                    return embedding;
                }
            }
        } catch (Exception e) {
            log.error("Error generating embeddings: {}", e.getMessage(), e);
        }
        return new double[0];
    }

    /**
     * Generate a structured summary of a policy document.
     */
    public String generateSummary(String documentText, String documentName) {
        String prompt = buildSummaryPrompt(documentText, documentName);
        return callOllamaGenerate(prompt);
    }

    /**
     * Call Ollama /api/chat with tool support for Agentic Workflows.
     */
    public Map<String, Object> chatWithTools(List<Map<String, Object>> messages, List<Map<String, Object>> tools) {
        String url = ollamaBaseUrl + "/api/chat";

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", ollamaModel);
        requestBody.put("messages", messages);
        requestBody.put("stream", false);
        if (tools != null && !tools.isEmpty()) {
            requestBody.put("tools", tools);
        }
        requestBody.put("options", Map.of("temperature", 0.1));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            log.info("Calling Ollama /api/chat with model: {}", ollamaModel);
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.POST, request, String.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return objectMapper.readValue(response.getBody(), new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});
            }
        } catch (Exception e) {
            log.error("Error calling Ollama /api/chat: {}", e.getMessage(), e);
        }
        return new HashMap<>();
    }

    /**
     * Call Ollama /api/chat and stream the response directly to an SseEmitter.
     */
    public void streamChat(List<Map<String, Object>> messages, org.springframework.web.servlet.mvc.method.annotation.SseEmitter emitter, java.util.function.Consumer<String> onComplete) {
        String url = ollamaBaseUrl + "/api/chat";

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", ollamaModel);
        requestBody.put("messages", messages);
        requestBody.put("stream", true);
        requestBody.put("options", Map.of("temperature", 0.1));

        restTemplate.execute(url, HttpMethod.POST, request -> {
            request.getHeaders().setContentType(MediaType.APPLICATION_JSON);
            request.getBody().write(objectMapper.writeValueAsBytes(requestBody));
        }, response -> {
            StringBuilder fullResponse = new StringBuilder();
            boolean clientDisconnected = false;
            try (java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.InputStreamReader(response.getBody()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    if (line.trim().isEmpty()) continue;
                    JsonNode node = objectMapper.readTree(line);
                    JsonNode messageNode = node.path("message");
                    if (messageNode.has("content")) {
                        String chunk = messageNode.get("content").asText();
                        if (!chunk.isEmpty()) {
                            fullResponse.append(chunk);
                            if (!clientDisconnected) {
                                try {
                                    emitter.send(org.springframework.web.servlet.mvc.method.annotation.SseEmitter.event().data(chunk));
                                } catch (Exception ex) {
                                    clientDisconnected = true;
                                    log.debug("Client disconnected during stream, continuing generation in background.");
                                }
                            }
                        }
                    }
                    if (node.path("done").asBoolean()) {
                        if (onComplete != null) {
                            onComplete.accept(fullResponse.toString());
                        }
                        if (!clientDisconnected) {
                            try {
                                emitter.send(org.springframework.web.servlet.mvc.method.annotation.SseEmitter.event().name("done").data("[DONE]"));
                                emitter.complete();
                            } catch (Exception ignored) {}
                        }
                    }
                }
            } catch (Exception e) {
                log.error("Error reading stream from Ollama", e);
                if (!clientDisconnected) {
                    emitter.completeWithError(e);
                }
            }
            return null;
        });
    }

    /**
     * Answer a question without tools.
     */
    public String answerQuestion(String question, String documentContext, String documentName) {
        String prompt = buildQAPrompt(question, documentContext, documentName);
        return callOllamaGenerate(prompt);
    }

    /**
     * Call Ollama's /api/generate endpoint (legacy, for summaries).
     */
    private String callOllamaGenerate(String prompt) {
        String url = ollamaBaseUrl + "/api/generate";

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", ollamaModel);
        requestBody.put("prompt", prompt);
        requestBody.put("stream", false);
        requestBody.put("options", Map.of(
                "temperature", 0.3,
                "num_predict", 2048
        ));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.POST, request, String.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                return cleanJsonResponse(jsonNode.path("response").asText());
            }
            return "Error: Unable to generate response from AI.";
        } catch (Exception e) {
            log.error("Error calling Ollama API: {}", e.getMessage(), e);
            return "Error: AI service is unavailable.";
        }
    }

    private String buildSummaryPrompt(String documentText, String documentName) {
        String truncatedText = documentText.length() > 8000
                ? documentText.substring(0, 8000) + "\n\n[... document continues ...]"
                : documentText;

        return """
                You are an expert policy analyst. Analyze the following policy document and provide a structured summary.
                
                Document Name: %s
                
                Document Content:
                %s
                
                Please provide your response in the following JSON format (respond ONLY with valid JSON, no other text):
                {
                    "title": "Document Name — Summary",
                    "overview": "A 2-3 sentence overview of the document",
                    "keyPoints": [
                        {
                            "icon": "one of: clock, calendar, shield, heart, users, lock, file-text, alert-triangle",
                            "title": "Key Point Title",
                            "detail": "Brief explanation of this key point"
                        }
                    ],
                    "sections": [
                        {
                            "name": "Section Name",
                            "pages": "estimated page range as a string, e.g. '1' or '2-3'"
                        }
                    ]
                }
                
                Include 4-6 key points and list the major sections of the document.
                """.formatted(documentName, truncatedText);
    }

    private String buildQAPrompt(String question, String documentContext, String documentName) {
        String truncatedContext = documentContext.length() > 6000
                ? documentContext.substring(0, 6000) + "\n\n[... document continues ...]"
                : documentContext;

        return """
                You are a helpful policy assistant. Answer the following question based ONLY on the provided policy document.
                If the answer is not found in the document, say so clearly.
                
                Document: %s
                
                Document Content:
                %s
                
                Question: %s
                
                Please provide your response in the following JSON format (respond ONLY with valid JSON, no other text):
                {
                    "answer": "Your detailed answer in markdown format. Use **bold** for key terms, bullet points for lists.",
                    "source": {
                        "document": "%s",
                        "section": "The section name where this information was found",
                        "page": "If known, the exact page number (do not guess total pages). If unknown, use 'N/A'"
                    },
                    "confidence": 85
                }
                
                The confidence should be 80-100 if directly found, 50-79 if inferred, below 50 if uncertain.
                """.formatted(documentName, truncatedContext, question, documentName);
    }

    public boolean isAvailable() {
        try {
            ResponseEntity<String> response = restTemplate.getForEntity(
                    ollamaBaseUrl + "/api/tags", String.class
            );
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            log.warn("Ollama is not available: {}", e.getMessage());
            return false;
        }
    }

    private String cleanJsonResponse(String response) {
        if (response == null) return "{}";
        String cleaned = response.trim();
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }
        return cleaned.trim();
    }
}

