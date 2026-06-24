package com.policyai.dto;

import com.policyai.model.Document;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentResponse {
    private Long id;
    private String name;
    private String fileName;
    private Long fileSize;
    private Integer pageCount;
    private String status;
    private String category;
    private String description;
    private LocalDateTime uploadedAt;

    public static DocumentResponse fromEntity(Document doc) {
        return DocumentResponse.builder()
                .id(doc.getId())
                .name(doc.getName())
                .fileName(doc.getFileName())
                .fileSize(doc.getFileSize())
                .pageCount(doc.getPageCount())
                .status(doc.getStatus().name().toLowerCase())
                .category(doc.getCategory())
                .description(doc.getDescription())
                .uploadedAt(doc.getUploadedAt())
                .build();
    }
}
