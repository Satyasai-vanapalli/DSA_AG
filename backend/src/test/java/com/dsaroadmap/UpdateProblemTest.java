package com.dsaroadmap;

import com.dsaroadmap.models.*;
import com.dsaroadmap.repositories.*;
import com.dsaroadmap.services.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class UpdateProblemTest {

    @Autowired ProblemService problemService;
    @Autowired ProblemRepository problemRepository;
    @Autowired ConceptRepository conceptRepository;

    @Test
    void testUpdate() {
        Concept c = new Concept();
        c.setName("test");
        c.setCategory("PRACTICE");
        c = conceptRepository.save(c);
        
        Problem p = new Problem();
        p.setTitle("p1");
        p.setConcept(c);
        p.setDifficulty("Easy");
        p.setCategory("PRACTICE");
        
        Problem saved = problemService.createProblem(p);
        
        Problem update = new Problem();
        update.setTitle("p2");
        update.setDifficulty("Medium");
        update.setConcept(c);
        
        Solution s = new Solution();
        s.setLanguage("Java");
        s.setBruteSolution("brute");
        AdditionalSolution as = new AdditionalSolution("a1", "c1");
        s.setAdditionalSolutions(new ArrayList<>(List.of(as)));
        update.setSolutions(List.of(s));
        
        Problem updated = problemService.updateProblem(saved.getId(), update);
        assertEquals("p2", updated.getTitle());
        assertEquals(1, updated.getSolutions().size());
        assertEquals(1, updated.getSolutions().get(0).getAdditionalSolutions().size());
    }
}
