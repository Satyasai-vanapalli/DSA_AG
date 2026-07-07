package com.dsaroadmap.config;

import com.dsaroadmap.models.Concept;
import com.dsaroadmap.repositories.ConceptRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class JavaCurriculumSeeder implements CommandLineRunner {

    private final ConceptRepository conceptRepository;
    private final ObjectMapper objectMapper;

    @Data
    public static class CurriculumNode {
        private String name;
        private String description;
        private List<CurriculumNode> subTopics;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // FORCE RE-SEED LEARN JAVA
        List<Concept> existingLearnConcepts = conceptRepository.findAll().stream().filter(c -> "LEARN".equals(c.getCategory()) && c.getParentId() == null).toList();
        if (!existingLearnConcepts.isEmpty()) {
            log.info("Deleting existing LEARN concepts to re-seed...");
            conceptRepository.deleteAll(existingLearnConcepts);
        }

        log.info("Seeding Learn Java Curriculum...");
        try (InputStream is = new ClassPathResource("java-curriculum.json").getInputStream()) {
            List<CurriculumNode> curriculum = objectMapper.readValue(is, new TypeReference<List<CurriculumNode>>() {});
            log.info("Read {} phases from java-curriculum.json", curriculum.size());

            for (int i = 0; i < curriculum.size(); i++) {
                seedNode(curriculum.get(i), null, i);
            }
            log.info("Successfully seeded Java curriculum concepts!");
        } catch (Exception e) {
            log.error("Failed to seed Java curriculum: ", e);
        }
    }

    private void seedNode(CurriculumNode node, java.util.UUID parentId, int orderIndex) {
        Concept concept = new Concept();
        concept.setName(node.getName());
        concept.setDescription(node.getDescription());
        concept.setOrderIndex(orderIndex);
        concept.setCategory("LEARN");
        concept.setMaterialOnly(true);
        concept.setParentId(parentId);
        concept = conceptRepository.save(concept);

        if (node.getSubTopics() != null && !node.getSubTopics().isEmpty()) {
            for (int i = 0; i < node.getSubTopics().size(); i++) {
                seedNode(node.getSubTopics().get(i), concept.getId(), i);
            }
        }
    }
}
