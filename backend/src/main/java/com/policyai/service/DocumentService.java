package com.policyai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.policyai.dto.DocumentResponse;
import com.policyai.dto.SummaryResponse;
import com.policyai.model.Document;
import com.policyai.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final PdfService pdfService;
    private final GeminiService geminiService;
    private final VectorStoreService vectorStoreService;
    private final com.policyai.repository.ChatMessageRepository chatMessageRepository;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Upload, process, and store a PDF document.
     */
    public DocumentResponse uploadDocument(MultipartFile file) throws IOException {
        // 1. Save the file
        String filePath = pdfService.saveFile(file);

        // 3. Create document entity
        String displayName = file.getOriginalFilename() != null
                ? file.getOriginalFilename().replace(".pdf", "").replace("_", " ").replace("-", " ")
                : "Untitled Document";

        String lowerName = displayName.toLowerCase();
        String category = "Uploaded";
        if (lowerName.contains("handbook")) category = "Handbook";
        else if (lowerName.contains("leave") || lowerName.contains("holiday") || lowerName.contains("hr")) category = "HR Policy";
        else if (lowerName.contains("wfh") || lowerName.contains("remote") || lowerName.contains("home")) category = "WFH Policy";
        else if (lowerName.contains("security") || lowerName.contains("it ")) category = "IT Policy";
        else if (lowerName.contains("conduct") || lowerName.contains("ethics")) category = "Compliance";

        Document document = Document.builder()
                .name(displayName)
                .fileName(file.getOriginalFilename())
                .filePath(filePath)
                .fileSize(file.getSize())
                .pageCount(0) // Default to 0, processed async
                .status(Document.DocumentStatus.PROCESSING)
                .category(category)
                .description("Uploaded policy document: " + file.getOriginalFilename())
                .extractedText(null) // Empty initially, extracted async
                .build();

        document = documentRepository.save(document);
        log.info("Document saved: id={}, name={}, pages={}", document.getId(), document.getName(), document.getPageCount());
        
        notificationService.createNotification(
            "Document Uploaded",
            "Started processing: " + document.getName(),
            "info"
        );

        // 5. Trigger async summary generation and vectorization
        generateSummaryAsync(document.getId());

        return DocumentResponse.fromEntity(document);
    }

    /**
     * Generate summary asynchronously after upload, and vectorize text.
     */
    @Async
    public void generateSummaryAsync(Long documentId) {
        try {
            log.info("Starting async summary and vector generation for document {}", documentId);
            Optional<Document> optDoc = documentRepository.findById(documentId);
            if (optDoc.isEmpty()) return;

            Document document = optDoc.get();

            // 1. Extract text and get page count
            try {
                int pageCount = pdfService.getPageCount(document.getFilePath());
                String extractedText = pdfService.extractText(document.getFilePath());
                document.setPageCount(pageCount);
                document.setExtractedText(extractedText);
                documentRepository.save(document); // Save text extraction progress
            } catch (Exception e) {
                log.error("Failed to extract text from PDF: {}", document.getFilePath(), e);
                // On Render's ephemeral filesystem, the file may not persist after upload.
                // Instead of marking as ERROR (which leaves it stuck), we mark it READY
                // with a fallback summary so the document still appears in the UI.
                document.setStatus(Document.DocumentStatus.READY);
                document.setSummary(buildFallbackSummary(document));
                document.setPageCount(0);
                documentRepository.save(document);
                notificationService.createNotification(
                    "Document Ready",
                    "Document saved: " + document.getName() + ". Note: text extraction was limited.",
                    "warning"
                );
                return;
            }

            if (geminiService.isAvailable()) {
                // Generate summary
                String summaryJson = geminiService.generateSummary(
                        document.getExtractedText(),
                        document.getName()
                );
                document.setSummary(summaryJson);
                document.setStatus(Document.DocumentStatus.READY);
                log.info("Summary generated for document {}", documentId);
                
                // Chunk and Vectorize
                processEmbeddings(document);

                notificationService.createNotification("Document Processed", "Summary and embeddings successfully generated for " + document.getName(), "success");
            } else {
                log.warn("Gemini API not available, marking document as ready without summary");
                document.setStatus(Document.DocumentStatus.READY);
                document.setSummary(buildFallbackSummary(document));
                notificationService.createNotification("Processing Complete", document.getName() + " is ready. AI summary was skipped (Gemini API unavailable).", "warning");
            }

            documentRepository.save(document);

        } catch (Exception e) {
            log.error("Error generating summary/vectors for document {}: {}", documentId, e.getMessage(), e);
            documentRepository.findById(documentId).ifPresent(doc -> {
                doc.setStatus(Document.DocumentStatus.ERROR);
                documentRepository.save(doc);
                notificationService.createNotification("Processing Failed", "Failed to process " + doc.getName(), "error");
            });
        }
    }

    /**
     * Splits document text into chunks and stores embeddings in the VectorStore.
     */
    private void processEmbeddings(Document document) {
        String text = document.getExtractedText();
        if (text == null || text.trim().isEmpty()) return;

        log.info("Generating embeddings for document {}", document.getName());
        String[] paragraphs = text.split("\\n\\n+");
        
        StringBuilder chunkBuilder = new StringBuilder();
        int maxChunkSize = 2000;

        for (String p : paragraphs) {
            if (p.trim().isEmpty()) continue;

            if (chunkBuilder.length() + p.length() > maxChunkSize) {
                String chunk = chunkBuilder.toString();
                double[] embedding = geminiService.getEmbedding(chunk);
                vectorStoreService.addChunk(document.getId(), document.getName(), chunk, embedding);
                chunkBuilder = new StringBuilder();
            }
            chunkBuilder.append(p).append("\n\n");
        }

        // Process remaining text
        if (chunkBuilder.length() > 0) {
            String chunk = chunkBuilder.toString();
            double[] embedding = geminiService.getEmbedding(chunk);
            vectorStoreService.addChunk(document.getId(), document.getName(), chunk, embedding);
        }
        log.info("Finished embedding document {}", document.getName());
    }

    /**
     * Get all documents ordered by upload date.
     */
    public List<DocumentResponse> getAllDocuments() {
        return documentRepository.findAllByOrderByUploadedAtDesc()
                .stream()
                .map(DocumentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get a single document by ID.
     */
    public Optional<DocumentResponse> getDocument(Long id) {
        return documentRepository.findById(id).map(DocumentResponse::fromEntity);
    }

    /**
     * Get document summary.
     */
    public Optional<SummaryResponse> getDocumentSummary(Long id) {
        return documentRepository.findById(id).map(doc -> {
            if (doc.getSummary() == null || doc.getSummary().isEmpty()) {
                return SummaryResponse.builder()
                        .title(doc.getName() + " — Summary")
                        .overview("Summary is being generated...")
                        .keyPoints(List.of())
                        .sections(List.of())
                        .build();
            }

            try {
                String raw = doc.getSummary();
                if (raw != null) {
                    raw = raw.trim();
                    if (raw.startsWith("```json")) raw = raw.substring(7);
                    else if (raw.startsWith("```")) raw = raw.substring(3);
                    if (raw.endsWith("```")) raw = raw.substring(0, raw.length() - 3);
                    raw = raw.trim();
                    raw = raw.replaceAll("\"pages\"\\s*:\\s*([0-9]+(?:-[0-9]+)?)", "\"pages\": \"$1\"");
                }
                return objectMapper.readValue(raw, SummaryResponse.class);
            } catch (Exception e) {
                log.warn("Failed to parse summary JSON: {}, returning raw text", e.getMessage());
                return SummaryResponse.builder()
                        .title(doc.getName() + " — Summary")
                        .overview(doc.getSummary())
                        .keyPoints(List.of())
                        .sections(List.of())
                        .build();
            }
        });
    }

    /**
     * Delete a document and its file.
     */
    @org.springframework.transaction.annotation.Transactional
    public boolean deleteDocument(Long id) {
        Optional<Document> optDoc = documentRepository.findById(id);
        if (optDoc.isEmpty()) return false;

        Document doc = optDoc.get();
        if (doc.getFilePath() != null) {
            pdfService.deleteFile(doc.getFilePath());
        }
        vectorStoreService.removeDocument(id);
        chatMessageRepository.deleteByDocumentId(id);
        documentRepository.delete(doc);
        log.info("Document deleted: id={}", id);
        return true;
    }

    /**
     * Search documents by name, category, or description.
     */
    public List<DocumentResponse> searchDocuments(String query) {
        return documentRepository.searchDocuments(query)
                .stream()
                .map(DocumentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get the raw extracted text of a document (used by ChatService).
     */
    public Optional<String> getDocumentText(Long id) {
        return documentRepository.findById(id).map(Document::getExtractedText);
    }

    /**
     * Get document name by ID.
     */
    public Optional<String> getDocumentName(Long id) {
        return documentRepository.findById(id).map(Document::getName);
    }

    /**
     * Re-trigger async processing for a document.
     * Returns true if the document was found and re-processing started.
     */
    public boolean reprocessDocument(Long id) {
        Optional<Document> optDoc = documentRepository.findById(id);
        if (optDoc.isEmpty()) return false;

        Document doc = optDoc.get();
        doc.setStatus(Document.DocumentStatus.PROCESSING);
        documentRepository.save(doc);
        generateSummaryAsync(id);
        log.info("Re-processing triggered for document {}", id);
        return true;
    }

    /**
     * On startup, automatically fix any documents stuck in PROCESSING state
     * (e.g., from a previous deployment that failed mid-processing).
     */
    @org.springframework.context.event.EventListener(org.springframework.boot.context.event.ApplicationStartedEvent.class)
    public void fixStuckDocumentsOnStartup() {
        try {
            List<Document> stuckDocs = documentRepository.findAll().stream()
                .filter(d -> d.getStatus() == Document.DocumentStatus.PROCESSING)
                .collect(Collectors.toList());

            if (!stuckDocs.isEmpty()) {
                log.warn("Found {} documents stuck in PROCESSING state. Re-triggering processing...", stuckDocs.size());
                for (Document doc : stuckDocs) {
                    generateSummaryAsync(doc.getId());
                }
            }
        } catch (Exception e) {
            log.error("Error during startup stuck-document fix: {}", e.getMessage());
        }
    }

    /**
     * Build a fallback summary when Ollama is unavailable.
     */
    private String buildFallbackSummary(Document doc) {
        return """
                {
                    "title": "%s — Summary",
                    "overview": "This document has been uploaded and is ready for Q&A. AI summary generation may not have completed. You can still ask questions about this document in the Chat section.",
                    "keyPoints": [
                        {
                            "icon": "file-text",
                            "title": "Document Uploaded",
                            "detail": "The document has been saved and is available for chat queries."
                        },
                        {
                            "icon": "alert-triangle",
                            "title": "AI Summary Pending",
                            "detail": "Full AI analysis could not be completed. Ask questions in Chat for instant answers."
                        }
                    ],
                    "sections": []
                }
                """.formatted(doc.getName());
    }
}
