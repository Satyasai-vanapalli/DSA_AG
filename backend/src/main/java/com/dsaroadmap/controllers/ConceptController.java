package com.dsaroadmap.controllers;

import com.dsaroadmap.models.Concept;
import com.dsaroadmap.services.ConceptService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/concepts")
@RequiredArgsConstructor
public class ConceptController {

    private final ConceptService conceptService;

    @GetMapping
    public ResponseEntity<List<Concept>> getAllConcepts() {
        return ResponseEntity.ok(conceptService.getAllConcepts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Concept> getConceptById(@PathVariable UUID id) {
        return ResponseEntity.ok(conceptService.getConceptById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Concept> createConcept(@RequestBody Concept concept) {
        return ResponseEntity.ok(conceptService.createConcept(concept));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Concept> updateConcept(@PathVariable UUID id, @RequestBody Concept concept) {
        return ResponseEntity.ok(conceptService.updateConcept(id, concept));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteConcept(@PathVariable UUID id) {
        conceptService.deleteConcept(id);
        return ResponseEntity.noContent().build();
    }
}
