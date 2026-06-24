package com.policyai.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UploadResponse {
    private Long id;
    private String name;
    private String fileName;
    private String status;
    private String message;
}
