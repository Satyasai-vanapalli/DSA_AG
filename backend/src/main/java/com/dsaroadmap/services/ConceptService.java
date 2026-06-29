package com.dsaroadmap.services;

import com.dsaroadmap.models.Concept;
import com.dsaroadmap.repositories.ConceptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ConceptService {

    private final ConceptRepository conceptRepository;

    public List<Concept> getAllConcepts() {
        return conceptRepository.findAll();
    }

    public Concept getConceptById(UUID id) {
        return conceptRepository.findById(id).orElseThrow(() -> new RuntimeException("Concept not found"));
    }

    public Concept createConcept(Concept concept) {
        return conceptRepository.save(concept);
    }

    public Concept updateConcept(UUID id, Concept updatedConcept) {
        Concept existing = getConceptById(id);
        existing.setName(updatedConcept.getName());
        return conceptRepository.save(existing);
    }

    public void deleteConcept(UUID id) {
        conceptRepository.deleteById(id);
    }
}
