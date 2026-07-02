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
        if (updatedProblem.getPlatformLinks() != null) {
            // Remove links not in the updated list
            existing.getPlatformLinks().removeIf(existingLink -> 
                updatedProblem.getPlatformLinks().stream().noneMatch(updatedLink -> 
                    updatedLink.getPlatformName().equals(existingLink.getPlatformName()) && 
                    updatedLink.getUrl().equals(existingLink.getUrl())
                )
            );
            // Add new links
            for (com.dsaroadmap.models.PlatformLink updatedLink : updatedProblem.getPlatformLinks()) {
                boolean exists = existing.getPlatformLinks().stream().anyMatch(existingLink -> 
                    existingLink.getPlatformName().equals(updatedLink.getPlatformName()) && 
                    existingLink.getUrl().equals(updatedLink.getUrl())
                );
                if (!exists) {
                    updatedLink.setId(null);
                    updatedLink.setProblem(existing);
                    existing.getPlatformLinks().add(updatedLink);
                }
            }
        }
        if (updatedProblem.getSolutions() != null) {
            // Remove solutions not present in the updated list
            existing.getSolutions().removeIf(existingSol -> 
                updatedProblem.getSolutions().stream().noneMatch(updatedSol -> 
                    updatedSol.getLanguage().equals(existingSol.getLanguage())
                )
            );
            
            // Add or update solutions
            for (com.dsaroadmap.models.Solution updatedSol : updatedProblem.getSolutions()) {
                com.dsaroadmap.models.Solution existingSol = existing.getSolutions().stream()
                    .filter(s -> s.getLanguage().equals(updatedSol.getLanguage()))
                    .findFirst().orElse(null);
                    
                if (existingSol != null) {
                    existingSol.setBruteSolution(updatedSol.getBruteSolution());
                    existingSol.setBetterSolution(updatedSol.getBetterSolution());
                    existingSol.setOptimalSolution(updatedSol.getOptimalSolution());
                    
                    existingSol.getAdditionalSolutions().clear();
                    if (updatedSol.getAdditionalSolutions() != null) {
                        existingSol.getAdditionalSolutions().addAll(updatedSol.getAdditionalSolutions());
                    }
                } else {
                    updatedSol.setId(null);
                    updatedSol.setProblem(existing);
                    existing.getSolutions().add(updatedSol);
                }
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
}
