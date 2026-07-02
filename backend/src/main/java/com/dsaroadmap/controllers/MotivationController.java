package com.dsaroadmap.controllers;

import com.dsaroadmap.models.Motivation;
import com.dsaroadmap.repositories.MotivationRepository;
import com.dsaroadmap.services.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MotivationController {

    private final MotivationRepository motivationRepository;
    private final FileStorageService fileStorageService;

    @GetMapping("/motivation")
    public ResponseEntity<List<Motivation>> getActiveMotivations() {
        return ResponseEntity.ok(motivationRepository.findByIsActiveOrderByCreatedAtDesc(true));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/motivation")
    public ResponseEntity<List<Motivation>> getAllMotivations() {
        return ResponseEntity.ok(motivationRepository.findAllByOrderByCreatedAtDesc());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/motivation/upload")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        String fileUrl = fileStorageService.saveFile(file);
        return ResponseEntity.ok(Map.of("url", fileUrl));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/motivation")
    public ResponseEntity<Motivation> createMotivation(@RequestBody Motivation motivation) {
        return ResponseEntity.ok(motivationRepository.save(motivation));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/motivation/{id}")
    public ResponseEntity<Motivation> updateMotivation(@PathVariable UUID id, @RequestBody Motivation motivation) {
        Motivation existing = motivationRepository.findById(id).orElseThrow();
        existing.setType(motivation.getType());
        existing.setContent(motivation.getContent());
        existing.setAuthor(motivation.getAuthor());
        existing.setActive(motivation.isActive());
        return ResponseEntity.ok(motivationRepository.save(existing));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/admin/motivation/{id}")
    public ResponseEntity<Void> deleteMotivation(@PathVariable UUID id) {
        Motivation motivation = motivationRepository.findById(id).orElseThrow();
        if (motivation.getType().equals("IMAGE") || motivation.getType().equals("VIDEO")) {
            fileStorageService.deleteFile(motivation.getContent());
        }
        motivationRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
