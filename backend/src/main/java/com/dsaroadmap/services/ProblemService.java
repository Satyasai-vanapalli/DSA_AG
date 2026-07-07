package com.dsaroadmap.services;

import com.dsaroadmap.models.Concept;
import com.dsaroadmap.models.Problem;
import com.dsaroadmap.repositories.ProblemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ProblemService {

    private final ProblemRepository problemRepository;
    private final ConceptService conceptService;

    public List<Problem> getAllProblems() {
        return problemRepository.findAll();
    }

    public List<Problem> searchProblems(String title) {
        return problemRepository.findByTitleContainingIgnoreCase(title);
    }

    public List<Problem> filterProblems(String difficulty) {
        return problemRepository.findByDifficultyIgnoreCase(difficulty);
    }

    public Problem getProblemById(UUID id) {
        return problemRepository.findById(id).orElseThrow(() -> new RuntimeException("Problem not found"));
    }

    public List<Problem> getProblemsByConcept(UUID conceptId) {
        return problemRepository.findByConceptOrderByOrderIndexAsc(conceptService.getConceptById(conceptId));
    }

    public List<Problem> getProblemsByCategory(String category) {
        return problemRepository.findByCategoryOrderByOrderIndexAsc(category);
    }

    public Problem createProblem(Problem problem) {
        if (problem.getConcept() != null && problem.getConcept().getId() != null) {
            Concept managedConcept = conceptService.getConceptById(problem.getConcept().getId());
            problem.setConcept(managedConcept);
        }
        
        // Auto-set orderIndex
        List<Problem> existing = problemRepository.findByConcept(problem.getConcept());
        int maxOrder = existing.stream()
                .mapToInt(p -> p.getOrderIndex() == null ? 0 : p.getOrderIndex())
                .max().orElse(-1);
        problem.setOrderIndex(maxOrder + 1);
        if (problem.getPlatformLinks() != null) {
            problem.getPlatformLinks().forEach(link -> link.setProblem(problem));
        }
        if (problem.getSolutions() != null) {
            problem.getSolutions().forEach(solution -> solution.setProblem(problem));
        }
        return problemRepository.save(problem);
    }

    public Problem updateProblem(UUID id, Problem updatedProblem) {
        Problem existing = getProblemById(id);
        existing.setTitle(updatedProblem.getTitle());
        existing.setDifficulty(updatedProblem.getDifficulty());
        existing.setDescription(updatedProblem.getDescription());
        existing.setProblemLink(updatedProblem.getProblemLink());
        existing.setYoutubeLink(updatedProblem.getYoutubeLink());
        existing.setDocumentationLink(updatedProblem.getDocumentationLink());
        existing.setCategory(updatedProblem.getCategory());
        
        if (updatedProblem.getConcept() != null && updatedProblem.getConcept().getId() != null) {
            existing.setConcept(conceptService.getConceptById(updatedProblem.getConcept().getId()));
        }
        
        // Sync PlatformLinks
        existing.getPlatformLinks().clear();
        if (updatedProblem.getPlatformLinks() != null) {
            for (com.dsaroadmap.models.PlatformLink link : updatedProblem.getPlatformLinks()) {
                link.setId(null);
                link.setProblem(existing);
                existing.getPlatformLinks().add(link);
            }
        }
        
        // Sync Solutions
        existing.getSolutions().clear();
        if (updatedProblem.getSolutions() != null) {
            for (com.dsaroadmap.models.Solution sol : updatedProblem.getSolutions()) {
                sol.setId(null);
                sol.setProblem(existing);
                // additionalSolutions is now JSONB, so it saves exactly as provided!
                existing.getSolutions().add(sol);
            }
        }
        
        return problemRepository.save(existing);
    }

    public void deleteProblem(UUID id) {
        problemRepository.deleteById(id);
    }

    public void reorderProblems(List<UUID> problemIds) {
        for (int i = 0; i < problemIds.size(); i++) {
            Problem problem = getProblemById(problemIds.get(i));
            problem.setOrderIndex(i);
            problemRepository.save(problem);
        }
    }

    public Problem moveProblemToConcept(UUID problemId, UUID conceptId) {
        Problem problem = getProblemById(problemId);
        if (conceptId == null) {
            problem.setConcept(null);
        } else {
            Concept concept = conceptService.getConceptById(conceptId);
            problem.setConcept(concept);
        }
        return problemRepository.save(problem);
    }
}
