package com.policyai.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@Slf4j
public class PdfService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    /**
     * Save uploaded file to disk and return the stored file path.
     */
    public String saveFile(MultipartFile file) throws IOException {
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);

        String uniqueFileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(uniqueFileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        log.info("Saved PDF file: {}", filePath);
        return filePath.toString();
    }

    /**
     * Extract text from a PDF file using Apache PDFBox.
     */
    public String extractText(String filePath) throws IOException {
        log.info("Extracting text from PDF: {}", filePath);

        try (PDDocument document = Loader.loadPDF(Paths.get(filePath).toFile())) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            log.info("Extracted {} characters from PDF", text.length());
            return text;
        }
    }

    /**
     * Get the number of pages in a PDF file.
     */
    public int getPageCount(String filePath) throws IOException {
        try (PDDocument document = Loader.loadPDF(Paths.get(filePath).toFile())) {
            return document.getNumberOfPages();
        }
    }

    /**
     * Delete a stored PDF file.
     */
    public void deleteFile(String filePath) {
        try {
            Files.deleteIfExists(Paths.get(filePath));
            log.info("Deleted file: {}", filePath);
        } catch (IOException e) {
            log.warn("Failed to delete file: {}", filePath, e);
        }
    }
}
