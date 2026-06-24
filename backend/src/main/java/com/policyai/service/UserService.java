package com.policyai.service;

import com.policyai.model.User;
import com.policyai.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.name}")
    private String adminName;

    @Value("${app.admin.password}")
    private String adminPassword;

    /**
     * Seeds the default admin user on first run.
     * Uses the credentials from application.properties.
     */
    @PostConstruct
    public void initDefaultUser() {
        if (userRepository.count() == 0) {
            User admin = User.builder()
                    .name(adminName)
                    .email(adminEmail)
                    .role("Administrator")
                    .passwordHash(passwordEncoder.encode(adminPassword))
                    .twoFaEnabled(false)
                    .avatarUrl(null)
                    .build();
            userRepository.save(admin);
            log.info("Initialized default admin user: {}", adminEmail);
        } else {
            // If user exists but has no password hash (migration from old version), set it now
            userRepository.findByEmail(adminEmail).ifPresent(user -> {
                if (user.getPasswordHash() == null || user.getPasswordHash().isBlank()) {
                    user.setPasswordHash(passwordEncoder.encode(adminPassword));
                    userRepository.save(user);
                    log.info("Migrated existing user to hashed password: {}", adminEmail);
                }
            });
        }
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public User updateUser(User user) {
        return userRepository.save(user);
    }

    public User getCurrentUser() {
        return userRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("No user found"));
    }

    public User updateCurrentUser(String name, String email) {
        User user = getCurrentUser();
        if (name != null && !name.isBlank()) user.setName(name);
        if (email != null && !email.isBlank()) user.setEmail(email);
        return userRepository.save(user);
    }

    /**
     * Change the user's password after verifying the current one.
     * @throws IllegalArgumentException if current password is wrong
     */
    public void changePassword(User user, String currentPassword, String newPassword) {
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        log.info("Password changed for user: {}", user.getEmail());
    }

    public void recordLogin(User user) {
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
    }

    /**
     * Delete the user and all associated data.
     */
    public void deleteAccount(User user) {
        log.warn("Deleting account for user: {}", user.getEmail());
        userRepository.delete(user);
    }

    public void savePendingTwoFaSecret(User user, String secret) {
        user.setTwoFaPendingSecret(secret);
        userRepository.save(user);
    }

    public void activate2FA(User user, String secret) {
        user.setTwoFaSecret(secret);
        user.setTwoFaEnabled(true);
        user.setTwoFaPendingSecret(null);
        userRepository.save(user);
    }

    public void disable2FA(User user) {
        user.setTwoFaEnabled(false);
        user.setTwoFaSecret(null);
        user.setTwoFaPendingSecret(null);
        userRepository.save(user);
    }
}

