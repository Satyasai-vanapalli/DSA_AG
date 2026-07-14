package com.dsaroadmap.repositories;

import com.dsaroadmap.models.MotivationComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MotivationCommentRepository extends JpaRepository<MotivationComment, UUID> {
    List<MotivationComment> findByMotivationIdOrderByCreatedAtAsc(UUID motivationId);
    void deleteByMotivationId(UUID motivationId);
    int countByMotivationId(UUID motivationId);
}
