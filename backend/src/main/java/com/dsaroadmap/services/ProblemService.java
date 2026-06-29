package com.dsaroadmap.services;

import com.dsaroadmap.models.Problem;
import com.dsaroadmap.repositories.ProblemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProblemService {

    private final ProblemRepository problemRepository;
    private final ConceptService conceptService;

    public List<Problem> getAllProblems() {
        return problemRepository.findAll();
    }

    public Problem getProblemById(UUID id) {
        return problemRepository.findById(id).orElseThrow(() -> new RuntimeException("Problem not found"));
    }

    public List<Problem> getProblemsByConcept(UUID conceptId) {
        return problemRepository.findByConcept(conceptService.getConceptById(conceptId));
    }

    public Problem createProblem(Problem problem) {
        return problemRepository.save(problem);
    }

    public Problem updateProblem(UUID id, Problem updatedProblem) {
        Problem existing = getProblemById(id);
        existing.setTitle(updatedProblem.getTitle());
        existing.setDescription(updatedProblem.getDescription());
        existing.setDifficulty(updatedProblem.getDifficulty());
        existing.setEstimatedTime(updatedProblem.getEstimatedTime());
        existing.setConstraints(updatedProblem.getConstraints());
        existing.setInputFormat(updatedProblem.getInputFormat());
        existing.setOutputFormat(updatedProblem.getOutputFormat());
        existing.setConcept(updatedProblem.getConcept());
        // Handling nested links, videos, solutions would require more logic here
        return problemRepository.save(existing);
    }

    public void deleteProblem(UUID id) {
        problemRepository.deleteById(id);
    }
}
