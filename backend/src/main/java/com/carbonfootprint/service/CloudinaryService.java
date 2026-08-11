package com.carbonfootprint.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${cloudinary.api-key:}")
    private String apiKey;

    @Value("${cloudinary.api-secret:}")
    private String apiSecret;

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public String uploadFile(MultipartFile file, String folder) throws IOException {
        log.info("Cloudinary Config properties: cloudName='{}', apiKey='{}', apiSecret='{}'", cloudName, apiKey, apiSecret);
        
        // Helper method to perform local file save
        java.util.function.Supplier<String> saveLocally = () -> {
            try {
                log.info("Saving file locally to uploads folder.");
                Path uploadDir = Paths.get("uploads");
                if (!Files.exists(uploadDir)) {
                    Files.createDirectories(uploadDir);
                }
                
                String originalFilename = file.getOriginalFilename();
                String extension = "";
                if (originalFilename != null && originalFilename.contains(".")) {
                    extension = originalFilename.substring(originalFilename.lastIndexOf("."));
                }
                
                String filename = UUID.randomUUID().toString() + extension;
                Path filePath = uploadDir.resolve(filename);
                Files.write(filePath, file.getBytes());
                
                return "http://localhost:8081/uploads/" + filename;
            } catch (IOException e) {
                log.error("Failed to save file locally", e);
                return null;
            }
        };

        // If Cloudinary is not configured or uses default placeholders, save locally immediately
        if (cloudName == null || cloudName.trim().isEmpty() || "your_cloud_name".equals(cloudName) ||
            apiKey == null || apiKey.trim().isEmpty() || "your_api_key".equals(apiKey) ||
            apiSecret == null || apiSecret.trim().isEmpty() || "your_api_secret".equals(apiSecret)) {
            
            log.info("Cloudinary credentials are not configured or contain placeholders. Using local storage.");
            String localUrl = saveLocally.get();
            if (localUrl != null) return localUrl;
        }

        try {
            log.info("Attempting to upload to Cloudinary...");
            // Pass explicit current Unix timestamp so Cloudinary signature is always fresh.
            // Without this, the SDK may use a stale or skewed timestamp and Cloudinary
            // rejects the request with "Stale request" when server clock drifts > 1 hour.
            long nowEpoch = System.currentTimeMillis() / 1000L;
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", folder,
                            "resource_type", "auto",
                            "timestamp", nowEpoch
                    ));
            
            return uploadResult.get("secure_url").toString();
        } catch (Exception e) {
            log.warn("Cloudinary upload failed (credentials might be invalid or expired: {}). Falling back to local storage.", e.getMessage());
            String localUrl = saveLocally.get();
            if (localUrl != null) {
                return localUrl;
            }
            throw new IOException("Failed to save file locally after Cloudinary failure", e);
        }
    }
}
