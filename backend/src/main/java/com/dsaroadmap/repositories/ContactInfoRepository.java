package com.dsaroadmap.repositories;

import com.dsaroadmap.models.ContactInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ContactInfoRepository extends JpaRepository<ContactInfo, UUID> {
    Optional<ContactInfo> findByPlatform(String platform);
}
