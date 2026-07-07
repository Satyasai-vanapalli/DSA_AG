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
            List<CurriculumNode> nodes = objectMapper.readValue(is, new TypeReference<List<CurriculumNode>>() {});
            
            int mainOrder = 1;
            for (CurriculumNode node : nodes) {
                Concept parentConcept = Concept.builder()
                        .name(node.getName())
                        .description(node.getDescription())
                        .category("LEARN")
                        .isMaterialOnly(true)
                        .orderIndex(mainOrder++)
                        .build();
                parentConcept = conceptRepository.save(parentConcept);

                if (node.getSubTopics() != null && !node.getSubTopics().isEmpty()) {
                    int subOrder = 1;
                    for (CurriculumNode subNode : node.getSubTopics()) {
                        Concept subConcept = Concept.builder()
                                .name(subNode.getName())
                                .description(subNode.getDescription())
                                .category("LEARN")
                                .isMaterialOnly(true)
                                .parentId(parentConcept.getId())
                                .orderIndex(subOrder++)
                                .build();
                        conceptRepository.save(subConcept);
                    }
                }
            }
            log.info("Successfully seeded Learn Java Curriculum!");
        } catch (Exception e) {
            log.error("Failed to seed Learn Java Curriculum", e);
        }
    }
}
