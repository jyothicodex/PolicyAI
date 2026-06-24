package com.policyai.service;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class VectorStoreService {

    @Data
    @AllArgsConstructor
    public static class DocumentChunk {
        private Long documentId;
        private String documentName;
        private String text;
        private double[] embedding;
    }

    // In-memory store
    private final List<DocumentChunk> store = new ArrayList<>();

    /**
     * Add a chunk to the vector store.
     */
    public void addChunk(Long documentId, String documentName, String text, double[] embedding) {
        store.add(new DocumentChunk(documentId, documentName, text, embedding));
        log.debug("Added chunk for document: {}, store size: {}", documentName, store.size());
    }

    /**
     * Remove all chunks for a specific document.
     */
    public void removeDocument(Long documentId) {
        store.removeIf(chunk -> chunk.getDocumentId().equals(documentId));
    }

    /**
     * Search for the top K most similar chunks.
     * If documentId is null, searches across all documents.
     */
    public List<DocumentChunk> searchSimilar(double[] queryEmbedding, int topK, Long documentId) {
        if (store.isEmpty() || queryEmbedding == null || queryEmbedding.length == 0) {
            return new ArrayList<>();
        }

        return store.stream()
                .filter(chunk -> documentId == null || chunk.getDocumentId().equals(documentId))
                .map(chunk -> new ChunkScore(chunk, cosineSimilarity(queryEmbedding, chunk.getEmbedding())))
                // Sort by score descending
                .sorted(Comparator.comparingDouble(ChunkScore::getScore).reversed())
                .limit(topK)
                .map(ChunkScore::getChunk)
                .collect(Collectors.toList());
    }

    @Data
    @AllArgsConstructor
    private static class ChunkScore {
        private DocumentChunk chunk;
        private double score;
    }

    /**
     * Calculate Cosine Similarity between two vectors.
     */
    private double cosineSimilarity(double[] vectorA, double[] vectorB) {
        if (vectorA.length != vectorB.length) {
            log.warn("Vector dimensions do not match: {} vs {}", vectorA.length, vectorB.length);
            return 0.0;
        }

        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;
        for (int i = 0; i < vectorA.length; i++) {
            dotProduct += vectorA[i] * vectorB[i];
            normA += Math.pow(vectorA[i], 2);
            normB += Math.pow(vectorB[i], 2);
        }

        if (normA == 0 || normB == 0) return 0.0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}
