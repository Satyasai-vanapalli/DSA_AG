package com.dsaroadmap.services;

import com.dsaroadmap.models.Problem;
import com.dsaroadmap.models.Solution;
import com.dsaroadmap.repositories.ProblemRepository;
import com.dsaroadmap.repositories.SolutionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SolutionService {

    private final SolutionRepository solutionRepository;
    private final ProblemRepository problemRepository;

    public List<Solution> getSolutionsByProblem(UUID problemId) {
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new RuntimeException("Problem not found"));
        return solutionRepository.findByProblem(problem);
    }

    public Solution createSolution(Solution solution) {
        if (solution.getProblem() == null || solution.getProblem().getId() == null) {
            throw new RuntimeException("Problem must be specified");
        }
        Problem problem = problemRepository.findById(solution.getProblem().getId())
                .orElseThrow(() -> new RuntimeException("Problem not found"));
        solution.setProblem(problem);
        return solutionRepository.save(solution);
    }

    public Solution updateSolution(UUID id, Solution updatedSolution) {
        Solution existing = solutionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Solution not found"));
        existing.setLanguage(updatedSolution.getLanguage());
        existing.setBruteSolution(updatedSolution.getBruteSolution());
        existing.setBetterSolution(updatedSolution.getBetterSolution());
        existing.setOptimalSolution(updatedSolution.getOptimalSolution());
        if (updatedSolution.getAdditionalSolutions() != null) {
            existing.getAdditionalSolutions().clear();
            existing.getAdditionalSolutions().addAll(updatedSolution.getAdditionalSolutions());
        }
        return solutionRepository.save(existing);
    }

    public void deleteSolution(UUID id) {
        solutionRepository.deleteById(id);
    }
}
