package com.dsaroadmap.repositories;

import com.dsaroadmap.models.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface TopicRepository extends JpaRepository<Topic, UUID> {

}
