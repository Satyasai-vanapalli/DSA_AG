package com.dsaroadmap.repositories;

import com.dsaroadmap.models.Concept;
import com.dsaroadmap.models.ConceptProgress;
import com.dsaroadmap.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConceptProgressRepository extends JpaRepository<ConceptProgress, UUID> {
    Optional<ConceptProgress> findByUserAndConcept(User user, Concept concept);
    List<ConceptProgress> findByUser(User user);
    
    @Query("SELECT cp FROM ConceptProgress cp JOIN FETCH cp.concept WHERE cp.user = :user")
    List<ConceptProgress> findByUserWithConcept(User user);
}
