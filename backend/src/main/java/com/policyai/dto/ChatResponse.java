package com.policyai.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatResponse {
    private String answer;
    private String role;
    private SourceInfo source;
    private Integer confidence;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SourceInfo {
        private String document;
        private String section;
        private String page;
    }
}
