package com.policyai.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        log.info("Sending password reset email to {}", toEmail);
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("noreply@policyai.com");
            message.setTo(toEmail);
            message.setSubject("Password Reset Request - PolicyAI");
            
            // In a real application, this would point to the frontend reset password page
            String resetUrl = "http://localhost:5173/reset-password?token=" + resetToken;
            
            // For local development without real email credentials, save the email as a local file
            java.io.File emailDir = new java.io.File("emails");
            if (!emailDir.exists()) {
                emailDir.mkdir();
            }
            
            String fileName = "emails/reset_" + System.currentTimeMillis() + ".txt";
            java.io.FileWriter writer = new java.io.FileWriter(fileName);
            writer.write("To: " + toEmail + "\n");
            writer.write("Subject: Password Reset Request - PolicyAI\n");
            writer.write("------------------------------------------\n\n");
            writer.write("Hello,\n\n" +
                    "You have requested to reset your password. Please click the link below to set a new password:\n\n" +
                    resetUrl + "\n\n" +
                    "If you did not request this, please ignore this email.\n\n" +
                    "Best regards,\nPolicyAI Team");
            writer.close();
            
            log.info("Password reset email saved to local file: {}", fileName);
        } catch (Exception e) {
            log.error("Failed to save password reset email to file: {}", e.getMessage());
            throw new RuntimeException("Failed to send email.");
        }
    }
}
