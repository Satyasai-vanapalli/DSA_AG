package com.dsaroadmap.repositories;

import com.dsaroadmap.models.Concept;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface ConceptRepository extends JpaRepository<Concept, UUID> {

    java.util.List<Concept> findAllByOrderByOrderIndexAsc();
    java.util.List<Concept> findByCategoryOrderByOrderIndexAsc(String category);
    java.util.List<Concept> findByCategoryAndParentIdIsNullOrderByOrderIndexAsc(String category);
    java.util.List<Concept> findByParentIdOrderByOrderIndexAsc(UUID parentId);
    java.util.List<Concept> findByNameContainingIgnoreCaseOrderByOrderIndexAsc(String name);
    long countByCategory(String category);
}
