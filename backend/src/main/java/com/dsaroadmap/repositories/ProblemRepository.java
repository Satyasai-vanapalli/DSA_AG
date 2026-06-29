package com.dsaroadmap.repositories;

import com.dsaroadmap.models.Problem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface ProblemRepository extends JpaRepository<Problem, UUID> {
    java.util.List<Problem> findByConcept(com.dsaroadmap.models.Concept concept);
}
