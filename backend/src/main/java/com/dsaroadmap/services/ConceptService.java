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
        return conceptRepository.findAllByOrderByOrderIndexAsc();
    }

    public List<Concept> getConceptsByCategory(String category) {
        return conceptRepository.findByCategoryAndParentIdIsNullOrderByOrderIndexAsc(category);
    }

    public List<Concept> getSubConcepts(UUID parentId) {
        return conceptRepository.findByParentIdOrderByOrderIndexAsc(parentId);
    }

    public List<Concept> searchConcepts(String name) {
        return conceptRepository.findByNameContainingIgnoreCaseOrderByOrderIndexAsc(name);
    }

    public Concept getConceptById(UUID id) {
        return conceptRepository.findById(id).orElseThrow(() -> new RuntimeException("Concept not found"));
    }

    public Concept createConcept(Concept concept) {
        int maxOrderIndex;
        if (concept.getParentId() != null) {
            // Sub-concept: order within siblings
            maxOrderIndex = conceptRepository.findByParentIdOrderByOrderIndexAsc(concept.getParentId()).stream()
                    .mapToInt(c -> c.getOrderIndex() == null ? 0 : c.getOrderIndex())
                    .max()
                    .orElse(-1);
        } else {
            // Top-level: order within category
            maxOrderIndex = conceptRepository.findAll().stream()
                    .filter(c -> concept.getCategory() != null && concept.getCategory().equals(c.getCategory()))
                    .filter(c -> c.getParentId() == null)
                    .mapToInt(c -> c.getOrderIndex() == null ? 0 : c.getOrderIndex())
                    .max()
                    .orElse(-1);
        }
        concept.setOrderIndex(maxOrderIndex + 1);
        return conceptRepository.save(concept);
    }

    public Concept updateConcept(UUID id, Concept updatedConcept) {
        Concept existing = getConceptById(id);
        existing.setName(updatedConcept.getName());
        if (updatedConcept.getDescription() != null) {
            existing.setDescription(updatedConcept.getDescription());
        }
        if (updatedConcept.getCategory() != null) {
            existing.setCategory(updatedConcept.getCategory());
        }
        return conceptRepository.save(existing);
    }

    public void deleteConcept(UUID id) {
        conceptRepository.deleteById(id);
    }

    public void reorderConcepts(List<UUID> conceptIds) {
        for (int i = 0; i < conceptIds.size(); i++) {
            Concept concept = getConceptById(conceptIds.get(i));
            concept.setOrderIndex(i);
            conceptRepository.save(concept);
        }
    }
}
