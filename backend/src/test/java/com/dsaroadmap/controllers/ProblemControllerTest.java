package com.dsaroadmap.controllers;

import com.dsaroadmap.models.*;
import com.dsaroadmap.repositories.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.*;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ProblemControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired ConceptRepository conceptRepository;
    @Autowired ProblemRepository problemRepository;

    @Test
    @WithMockUser(roles = "ADMIN")
    void testCreateAndUpdateProblem() throws Exception {
        Concept c = new Concept();
        c.setName("test");
        c.setCategory("PRACTICE");
        c = conceptRepository.save(c);

        Map<String, Object> createReq = new HashMap<>();
        createReq.put("title", "p1");
        createReq.put("difficulty", "Easy");
        createReq.put("category", "PRACTICE");
        createReq.put("concept", Map.of("id", c.getId().toString()));

        List<Map<String, Object>> sols = new ArrayList<>();
        sols.add(Map.of(
            "language", "Java",
            "bruteSolution", "brute",
            "additionalSolutions", List.of(Map.of("name", "sol1", "code", "brute2"))
        ));
        createReq.put("solutions", sols);

        String response = mockMvc.perform(post("/api/problems")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        Problem created = objectMapper.readValue(response, Problem.class);

        // Update problem
        Map<String, Object> updateReq = new HashMap<>(createReq);
        updateReq.put("title", "p2");
        updateReq.put("solutions", List.of(Map.of(
            "id", created.getSolutions().get(0).getId().toString(),
            "language", "Java",
            "bruteSolution", "brute updated",
            "additionalSolutions", List.of(Map.of("name", "sol2", "code", "brute3"))
        )));

        mockMvc.perform(put("/api/problems/" + created.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk());
    }
}
