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

    @GetMapping("/search")
    public ResponseEntity<List<Concept>> searchConcepts(@RequestParam String q) {
        return ResponseEntity.ok(conceptService.searchConcepts(q));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Concept> getConceptById(@PathVariable UUID id) {
        return ResponseEntity.ok(conceptService.getConceptById(id));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Concept>> getConceptsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(conceptService.getConceptsByCategory(category));
    }

    @GetMapping("/{id}/children")
    public ResponseEntity<List<Concept>> getSubConcepts(@PathVariable UUID id) {
        return ResponseEntity.ok(conceptService.getSubConcepts(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or @categorySecurity.canEdit(authentication, #concept.category)")
    public ResponseEntity<Concept> createConcept(@RequestBody Concept concept) {
        return ResponseEntity.ok(conceptService.createConcept(concept));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @categorySecurity.canEditConcept(authentication, #id, @conceptRepository)")
    public ResponseEntity<Concept> updateConcept(@PathVariable UUID id, @RequestBody Concept concept) {
        return ResponseEntity.ok(conceptService.updateConcept(id, concept));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @categorySecurity.canEditConcept(authentication, #id, @conceptRepository)")
    public ResponseEntity<Void> deleteConcept(@PathVariable UUID id) {
        conceptService.deleteConcept(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/reorder")
    @PreAuthorize("hasRole('ADMIN') or @categorySecurity.canReorderConcepts(authentication, #conceptIds, @conceptRepository)")
    public ResponseEntity<Void> reorderConcepts(@RequestBody List<UUID> conceptIds) {
        conceptService.reorderConcepts(conceptIds);
        return ResponseEntity.ok().build();
    }
}
