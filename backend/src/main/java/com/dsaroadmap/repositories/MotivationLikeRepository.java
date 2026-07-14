package com.dsaroadmap.repositories;

import com.dsaroadmap.models.MotivationLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface MotivationLikeRepository extends JpaRepository<MotivationLike, UUID> {
    Optional<MotivationLike> findByMotivationIdAndUserId(UUID motivationId, UUID userId);
    void deleteByMotivationId(UUID motivationId);
    int countByMotivationId(UUID motivationId);
}
