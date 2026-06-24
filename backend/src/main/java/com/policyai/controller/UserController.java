package com.policyai.controller;

import com.policyai.model.User;
import com.policyai.service.JwtService;
import com.policyai.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final JwtService jwtService;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        User user = getUserFromToken(authHeader);
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));

        return ResponseEntity.ok(Map.of(
            "id", user.getId(),
            "name", user.getName(),
            "email", user.getEmail(),
            "role", user.getRole(),
            "twoFaEnabled", Boolean.TRUE.equals(user.getTwoFaEnabled()),
            "avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : "",
            "createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : "",
            "lastLoginAt", user.getLastLoginAt() != null ? user.getLastLoginAt().toString() : ""
        ));
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateCurrentUser(@RequestHeader("Authorization") String authHeader,
                                               @RequestBody Map<String, String> body) {
        User user = getUserFromToken(authHeader);
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));

        User updated = userService.updateCurrentUser(body.get("name"), body.get("email"));
        return ResponseEntity.ok(Map.of(
            "id", updated.getId(),
            "name", updated.getName(),
            "email", updated.getEmail(),
            "role", updated.getRole(),
            "twoFaEnabled", Boolean.TRUE.equals(updated.getTwoFaEnabled())
        ));
    }

    private User getUserFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7);
        if (!jwtService.isTokenValid(token)) return null;
        String email = jwtService.extractUsername(token);
        if (email.startsWith("pre-auth:")) return null;
        return userService.findByEmail(email).orElse(null);
    }
}
