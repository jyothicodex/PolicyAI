package com.policyai.controller;

import com.policyai.dto.AuthRequest;
import com.policyai.dto.AuthResponse;
import com.policyai.dto.ChangePasswordRequest;
import com.policyai.model.User;
import com.policyai.service.JwtService;
import com.policyai.service.TotpService;
import com.policyai.service.UserService;
import com.policyai.service.EmailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Authentication controller.
 * All endpoints under /api/auth/** are public (no JWT required).
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;
    private final TotpService totpService;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    /**
     * POST /api/auth/login
     * Validates email + password. If 2FA is enabled, returns requiresTwoFa=true
     * and a short-lived pre-auth token. Client must then call /api/auth/2fa/verify.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {
        User user = userService.findByEmail(request.getEmail())
                .orElse(null);

        if (user == null || user.getPasswordHash() == null
                || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Invalid email or password"));
        }

        // If 2FA is enabled, issue a temporary token signaling 2FA is needed
        if (Boolean.TRUE.equals(user.getTwoFaEnabled())) {
            String preAuthToken = jwtService.generateToken("pre-auth:" + user.getEmail(), user.getId());
            return ResponseEntity.ok(AuthResponse.builder()
                    .token(preAuthToken)
                    .tokenType("Bearer")
                    .requiresTwoFa(true)
                    .twoFaEnabled(true)
                    .build());
        }

        // No 2FA — issue full token immediately
        String token = jwtService.generateToken(user.getEmail(), user.getId());
        userService.recordLogin(user);
        log.info("User logged in: {}", user.getEmail());

        return ResponseEntity.ok(AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .twoFaEnabled(false)
                .requiresTwoFa(false)
                .build());
    }

    /**
     * POST /api/auth/2fa/verify
     * Verifies TOTP code during login. Requires the pre-auth token in Authorization header.
     * Body: { "code": "123456" }
     */
    @PostMapping("/2fa/verify")
    public ResponseEntity<?> verifyTwoFa(@RequestHeader("Authorization") String authHeader,
                                          @RequestBody Map<String, String> body) {
        String preAuthToken = extractToken(authHeader);
        if (preAuthToken == null || !jwtService.isTokenValid(preAuthToken)) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid or expired pre-auth token"));
        }

        String subject = jwtService.extractUsername(preAuthToken);
        if (!subject.startsWith("pre-auth:")) {
            return ResponseEntity.status(401).body(Map.of("error", "Token is not a pre-auth token"));
        }

        String email = subject.substring("pre-auth:".length());
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String code = body.get("code");
        if (code == null || !totpService.verifyCode(user.getTwoFaSecret(), code)) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid or expired 2FA code"));
        }

        // Issue full token
        String token = jwtService.generateToken(user.getEmail(), user.getId());
        userService.recordLogin(user);
        log.info("User completed 2FA login: {}", user.getEmail());

        return ResponseEntity.ok(AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .twoFaEnabled(true)
                .requiresTwoFa(false)
                .build());
    }

    /**
     * POST /api/auth/change-password (requires full JWT)
     */
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestHeader("Authorization") String authHeader,
                                             @Valid @RequestBody ChangePasswordRequest request) {
        User user = getUserFromToken(authHeader);
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));

        try {
            userService.changePassword(user, request.getCurrentPassword(), request.getNewPassword());
            return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/auth/2fa/setup — Initiate 2FA setup.
     * Generates a new TOTP secret, stores it as pending, returns secret + QR code.
     */
    @PostMapping("/2fa/setup")
    public ResponseEntity<?> setup2FA(@RequestHeader("Authorization") String authHeader) {
        User user = getUserFromToken(authHeader);
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));

        String secret = totpService.generateSecret();

        // Store the pending secret (not yet active — requires confirmation code)
        userService.savePendingTwoFaSecret(user, secret);

        String otpUri = totpService.buildOtpAuthUri(secret, user.getEmail(), "PolicyAI");
        String qrCodeBase64 = totpService.generateQrCodeBase64(otpUri);

        return ResponseEntity.ok(Map.of(
            "secret", secret,
            "qrCodeBase64", qrCodeBase64,
            "otpAuthUri", otpUri
        ));
    }

    /**
     * POST /api/auth/2fa/verify-setup — Confirm 2FA activation with a TOTP code.
     * Body: { "code": "123456" }
     */
    @PostMapping("/2fa/verify-setup")
    public ResponseEntity<?> verifySetup2FA(@RequestHeader("Authorization") String authHeader,
                                             @RequestBody Map<String, String> body) {
        User user = getUserFromToken(authHeader);
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));

        String pendingSecret = user.getTwoFaPendingSecret();
        if (pendingSecret == null) {
            return ResponseEntity.status(400).body(Map.of("error", "No pending 2FA setup found. Please start setup again."));
        }

        String code = body.get("code");
        if (!totpService.verifyCode(pendingSecret, code)) {
            return ResponseEntity.status(400).body(Map.of("error", "Invalid code. Please check your authenticator app."));
        }

        // Activate 2FA
        userService.activate2FA(user, pendingSecret);
        log.info("2FA enabled for user: {}", user.getEmail());

        return ResponseEntity.ok(Map.of("message", "Two-factor authentication enabled successfully"));
    }

    /**
     * POST /api/auth/2fa/disable — Disable 2FA (requires password confirmation).
     * Body: { "password": "..." }
     */
    @PostMapping("/2fa/disable")
    public ResponseEntity<?> disable2FA(@RequestHeader("Authorization") String authHeader,
                                         @RequestBody Map<String, String> body) {
        User user = getUserFromToken(authHeader);
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));

        String password = body.get("password");
        if (password == null || !passwordEncoder.matches(password, user.getPasswordHash())) {
            return ResponseEntity.status(400).body(Map.of("error", "Incorrect password"));
        }

        userService.disable2FA(user);
        log.info("2FA disabled for user: {}", user.getEmail());

        return ResponseEntity.ok(Map.of("message", "Two-factor authentication disabled"));
    }

    /**
     * DELETE /api/auth/account — Delete the user's account permanently.
     * Body: { "password": "..." }
     */
    @DeleteMapping("/account")
    public ResponseEntity<?> deleteAccount(@RequestHeader("Authorization") String authHeader,
                                            @RequestBody Map<String, String> body) {
        User user = getUserFromToken(authHeader);
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));

        String password = body.get("password");
        if (password == null || !passwordEncoder.matches(password, user.getPasswordHash())) {
            return ResponseEntity.status(400).body(Map.of("error", "Incorrect password. Account deletion requires password confirmation."));
        }

        userService.deleteAccount(user);
        log.warn("Account deleted for: {}", user.getEmail());

        return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
    }

    // Helper: extract User from JWT token in Authorization header
    private User getUserFromToken(String authHeader) {
        String token = extractToken(authHeader);
        if (token == null || !jwtService.isTokenValid(token)) return null;
        String email = jwtService.extractUsername(token);
        if (email.startsWith("pre-auth:")) return null; // pre-auth tokens can't access protected actions
        return userService.findByEmail(email).orElse(null);
    }

    private String extractToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }

        User user = userService.findByEmail(email).orElse(null);
        if (user != null) {
            // Generate a reset token valid for 15 minutes
            String resetToken = jwtService.generateToken("reset:" + user.getEmail(), user.getId(), 15 * 60 * 1000L);
            try {
                emailService.sendPasswordResetEmail(user.getEmail(), resetToken);
            } catch (Exception e) {
                log.error("Failed to send reset email", e);
                return ResponseEntity.internalServerError().body(Map.of("error", "Failed to send reset email."));
            }
        }
        
        // Always return OK to prevent email enumeration
        return ResponseEntity.ok(Map.of("message", "If an account exists, a reset link has been sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("password");

        if (token == null || newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Token and new password are required"));
        }

        if (!newPassword.matches("^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 8 characters long, contain 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character"));
        }

        try {
            Long userId = jwtService.extractUserId(token);
            String action = jwtService.extractUsername(token); // we packed action:email here

            if (userId == null || !action.startsWith("reset:")) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid or expired reset token"));
            }

            User user = userService.findById(userId).orElseThrow();
            user.setPasswordHash(passwordEncoder.encode(newPassword));
            userService.updateUser(user);

            return ResponseEntity.ok(Map.of("message", "Password successfully reset"));
        } catch (Exception e) {
            log.error("Failed to reset password", e);
            return ResponseEntity.status(401).body(Map.of("error", "Invalid or expired reset token"));
        }
    }
}
