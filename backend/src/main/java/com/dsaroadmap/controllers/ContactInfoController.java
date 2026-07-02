package com.dsaroadmap.controllers;

import com.dsaroadmap.models.ContactInfo;
import com.dsaroadmap.repositories.ContactInfoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ContactInfoController {

    private final ContactInfoRepository contactInfoRepository;

    @GetMapping("/contact")
    public ResponseEntity<List<ContactInfo>> getAllContacts() {
        return ResponseEntity.ok(contactInfoRepository.findAll());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/contact")
    public ResponseEntity<ContactInfo> createContact(@RequestBody ContactInfo contactInfo) {
        return ResponseEntity.ok(contactInfoRepository.save(contactInfo));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/contact/{id}")
    public ResponseEntity<ContactInfo> updateContact(@PathVariable UUID id, @RequestBody ContactInfo contactInfo) {
        ContactInfo existing = contactInfoRepository.findById(id).orElseThrow();
        existing.setPlatform(contactInfo.getPlatform());
        existing.setValue(contactInfo.getValue());
        existing.setLink(contactInfo.getLink());
        return ResponseEntity.ok(contactInfoRepository.save(existing));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/admin/contact/{id}")
    public ResponseEntity<Void> deleteContact(@PathVariable UUID id) {
        contactInfoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
