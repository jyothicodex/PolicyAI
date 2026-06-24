package com.policyai.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private String tokenType;
    private Long userId;
    private String name;
    private String email;
    private String role;
    private Boolean twoFaEnabled;
    /** Only present when 2FA is required but not yet verified */
    private Boolean requiresTwoFa;
}
