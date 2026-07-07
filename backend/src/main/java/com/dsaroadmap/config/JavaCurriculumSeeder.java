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
import org.springframework.jdbc.core.JdbcTemplate;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class JavaCurriculumSeeder implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;
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
        log.info("Dropping unique constraint on concepts table to prevent race conditions...");
        try {
            jdbcTemplate.execute("ALTER TABLE concepts DROP CONSTRAINT IF EXISTS uk7q1ebufjuenqwt0b5ca6ksuqa");
        } catch (Exception e) {
            log.warn("Could not drop constraint (might not exist): {}", e.getMessage());
        }

        log.info("Unlinking problems from LEARN concepts to prevent data loss...");
        jdbcTemplate.execute("UPDATE problems SET concept_id = NULL WHERE concept_id IN (SELECT id FROM concepts WHERE category = 'LEARN')");

        log.info("Deleting existing concept_progress for LEARN concepts to prevent foreign key constraint violations...");
        jdbcTemplate.execute("DELETE FROM concept_progress WHERE concept_id IN (SELECT id FROM concepts WHERE category = 'LEARN')");

        log.info("Deleting existing LEARN concepts to re-seed...");
        jdbcTemplate.execute("DELETE FROM concepts WHERE category = 'LEARN'");

        log.info("Seeding Learn Java Curriculum...");
        try (InputStream is = new ClassPathResource("java-curriculum.json").getInputStream()) {
            List<CurriculumNode> curriculum = objectMapper.readValue(is, new TypeReference<List<CurriculumNode>>() {});
            log.info("Read {} phases from java-curriculum.json", curriculum.size());

            List<Object[]> batchArgs = new ArrayList<>();
            for (int i = 0; i < curriculum.size(); i++) {
                buildBatchArgs(curriculum.get(i), null, i, batchArgs);
            }
            
            String sql = "INSERT INTO concepts (id, name, description, order_index, category, is_material_only, parent_id) VALUES (?, ?, ?, ?, 'LEARN', true, ?)";
            jdbcTemplate.batchUpdate(sql, batchArgs);
            
            log.info("Successfully seeded {} Java curriculum concepts!", batchArgs.size());
        } catch (Exception e) {
            log.error("Failed to seed Java curriculum: ", e);
        }
    }

    private void buildBatchArgs(CurriculumNode node, UUID parentId, int orderIndex, List<Object[]> batchArgs) {
        UUID id = UUID.randomUUID();
        batchArgs.add(new Object[]{ id, node.getName(), node.getDescription(), orderIndex, parentId });

        if (node.getSubTopics() != null && !node.getSubTopics().isEmpty()) {
            for (int i = 0; i < node.getSubTopics().size(); i++) {
                buildBatchArgs(node.getSubTopics().get(i), id, i, batchArgs);
            }
        }
    }
}
