package com.policyai.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import dev.samstevens.totp.code.*;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.secret.SecretGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import dev.samstevens.totp.time.TimeProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.Base64;

/**
 * Handles TOTP (Time-based One-Time Password) operations.
 * Compatible with Google Authenticator, Authy, and any TOTP app.
 */
@Service
@Slf4j
public class TotpService {

    private final SecretGenerator secretGenerator = new DefaultSecretGenerator(32);

    /**
     * Generate a new TOTP secret key.
     */
    public String generateSecret() {
        return secretGenerator.generate();
    }

    /**
     * Build the otpauth:// URI used to generate QR codes.
     */
    public String buildOtpAuthUri(String secret, String email, String issuer) {
        return String.format(
            "otpauth://totp/%s:%s?secret=%s&issuer=%s&algorithm=SHA1&digits=6&period=30",
            encode(issuer), encode(email), secret, encode(issuer)
        );
    }

    /**
     * Generate a base64-encoded PNG QR code image for the given otpauth URI.
     */
    public String generateQrCodeBase64(String otpAuthUri) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(otpAuthUri, BarcodeFormat.QR_CODE, 200, 200);
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
            return Base64.getEncoder().encodeToString(outputStream.toByteArray());
        } catch (Exception e) {
            log.error("Failed to generate QR code: {}", e.getMessage());
            throw new RuntimeException("QR code generation failed", e);
        }
    }

    /**
     * Verify a TOTP code against the stored secret.
     * Allows a window of ±1 time step (30 seconds) to account for clock drift.
     */
    public boolean verifyCode(String secret, String code) {
        try {
            TimeProvider timeProvider = new SystemTimeProvider();
            CodeGenerator codeGenerator = new DefaultCodeGenerator(HashingAlgorithm.SHA1, 6);
            CodeVerifier verifier = new DefaultCodeVerifier(codeGenerator, timeProvider);
            ((DefaultCodeVerifier) verifier).setTimePeriod(30);
            ((DefaultCodeVerifier) verifier).setAllowedTimePeriodDiscrepancy(1);
            return verifier.isValidCode(secret, code);
        } catch (Exception e) {
            log.warn("TOTP verification error: {}", e.getMessage());
            return false;
        }
    }

    private String encode(String value) {
        return java.net.URLEncoder.encode(value, java.nio.charset.StandardCharsets.UTF_8);
    }
}
