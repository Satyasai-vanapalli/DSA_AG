package com.dsaroadmap.repositories;

import com.dsaroadmap.models.MotivationView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MotivationViewRepository extends JpaRepository<MotivationView, UUID> {
    Optional<MotivationView> findByUserId(UUID userId);
    List<MotivationView> findAllByOrderByLastViewedAtDesc();
}
