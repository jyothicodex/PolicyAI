package com.policyai.controller;

import com.policyai.dto.DocumentResponse;
import com.policyai.dto.SummaryResponse;
import com.policyai.dto.UploadResponse;
import com.policyai.service.DocumentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@Slf4j
public class DocumentController {

    private final DocumentService documentService;

    /**
     * Upload a PDF document.
     * POST /api/documents/upload
     */
    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocument(@RequestParam("file") MultipartFile file) {
        // Validate file type
        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "File is empty"));
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.equals("application/pdf")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Only PDF files are accepted"));
        }

        try {
            DocumentResponse document = documentService.uploadDocument(file);

            UploadResponse response = UploadResponse.builder()
                    .id(document.getId())
                    .name(document.getName())
                    .fileName(document.getFileName())
                    .status(document.getStatus())
                    .message("Document uploaded successfully. AI summary is being generated.")
                    .build();

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            log.error("Error uploading document: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to upload document: " + e.getMessage()));
        }
    }

    /**
     * Get all documents.
     * GET /api/documents
     */
    @GetMapping
    public ResponseEntity<List<DocumentResponse>> getAllDocuments() {
        return ResponseEntity.ok(documentService.getAllDocuments());
    }

    /**
     * Get a single document by ID.
     * GET /api/documents/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getDocument(@PathVariable Long id) {
        return documentService.getDocument(id)
                .map(doc -> ResponseEntity.ok((Object) doc))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get document summary.
     * GET /api/documents/{id}/summary
     */
    @GetMapping("/{id}/summary")
    public ResponseEntity<?> getDocumentSummary(@PathVariable Long id) {
        return documentService.getDocumentSummary(id)
                .map(summary -> ResponseEntity.ok((Object) summary))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Delete a document.
     * DELETE /api/documents/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(@PathVariable Long id) {
        boolean deleted = documentService.deleteDocument(id);
        if (deleted) {
            return ResponseEntity.ok(Map.of("message", "Document deleted successfully"));
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Search documents.
     * GET /api/documents/search?q=query
     */
    @GetMapping("/search")
    public ResponseEntity<List<DocumentResponse>> searchDocuments(@RequestParam("q") String query) {
        return ResponseEntity.ok(documentService.searchDocuments(query));
    }

    /**
     * Re-trigger async processing for a document stuck in PROCESSING state.
     * POST /api/documents/{id}/reprocess
     */
    @PostMapping("/{id}/reprocess")
    public ResponseEntity<?> reprocessDocument(@PathVariable Long id) {
        boolean started = documentService.reprocessDocument(id);
        if (started) {
            return ResponseEntity.ok(Map.of("message", "Reprocessing started for document " + id));
        }
        return ResponseEntity.notFound().build();
    }
}
