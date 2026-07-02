package com.dsaroadmap.repositories;

import com.dsaroadmap.models.Motivation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MotivationRepository extends JpaRepository<Motivation, UUID> {
    List<Motivation> findByIsActiveOrderByCreatedAtDesc(boolean isActive);
    List<Motivation> findAllByOrderByCreatedAtDesc();
}
