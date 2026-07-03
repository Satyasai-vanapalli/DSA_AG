package com.dsaroadmap.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@Service
public class FileStorageService {

    private final String UPLOAD_DIR = "uploads/";
    private final Cloudinary cloudinary;

    public FileStorageService(@Value("${cloudinary.url:}") String cloudinaryUrl) {
        if (cloudinaryUrl != null && !cloudinaryUrl.isEmpty()) {
            this.cloudinary = new Cloudinary(cloudinaryUrl);
        } else {
            this.cloudinary = null;
            try {
                Files.createDirectories(Paths.get(UPLOAD_DIR));
            } catch (IOException e) {
                throw new RuntimeException("Could not create upload directory!");
            }
        }
    }

    public String saveFile(MultipartFile file) {
        try {
            if (cloudinary != null) {
                // Upload to Cloudinary
                Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                        "resource_type", "auto" // Automatically detect if it's image or video
                ));
                return uploadResult.get("secure_url").toString();
            } else {
                // Fallback to local storage
                String originalFilename = file.getOriginalFilename();
                String extension = "";
                if (originalFilename != null && originalFilename.contains(".")) {
                    extension = originalFilename.substring(originalFilename.lastIndexOf("."));
                }
                String newFilename = UUID.randomUUID().toString() + extension;
                Path filePath = Paths.get(UPLOAD_DIR + newFilename);
                Files.copy(file.getInputStream(), filePath);
                return "/api/uploads/" + newFilename; // Served locally
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file.", e);
        }
    }

    public void deleteFile(String fileUrl) {
        if (fileUrl == null) return;
        
        if (cloudinary != null && fileUrl.contains("res.cloudinary.com")) {
            // Delete from Cloudinary
            try {
                // Extract public ID from URL: e.g. https://res.cloudinary.com/demo/image/upload/v1234/sample.jpg -> sample
                String[] parts = fileUrl.split("/");
                String fileWithExt = parts[parts.length - 1];
                String publicId = fileWithExt.contains(".") ? fileWithExt.substring(0, fileWithExt.lastIndexOf('.')) : fileWithExt;
                
                String resourceType = fileUrl.contains("/video/") ? "video" : "image";
                cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("resource_type", resourceType));
            } catch (Exception e) {
                System.err.println("Failed to delete Cloudinary file: " + fileUrl);
            }
        } else if (fileUrl.startsWith("/api/uploads/")) {
            // Delete locally
            try {
                String filename = fileUrl.substring("/api/uploads/".length());
                Path filePath = Paths.get(UPLOAD_DIR + filename);
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                System.err.println("Failed to delete local file: " + fileUrl);
            }
        }
    }
}
