package com.dsaroadmap.controllers;

import com.dsaroadmap.models.Solution;
import com.dsaroadmap.services.SolutionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/solutions")
@RequiredArgsConstructor
public class SolutionController {

    private final SolutionService solutionService;

    @GetMapping("/problem/{problemId}")
    public ResponseEntity<List<Solution>> getSolutionsByProblem(@PathVariable UUID problemId) {
        return ResponseEntity.ok(solutionService.getSolutionsByProblem(problemId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or @categorySecurity.canEditProblem(authentication, #solution.problem.id, @problemRepository)")
    public ResponseEntity<Solution> createSolution(@RequestBody Solution solution) {
        return ResponseEntity.ok(solutionService.createSolution(solution));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @categorySecurity.canEditSolution(authentication, #id, @solutionRepository)")
    public ResponseEntity<Solution> updateSolution(@PathVariable UUID id, @RequestBody Solution solution) {
        return ResponseEntity.ok(solutionService.updateSolution(id, solution));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @categorySecurity.canEditSolution(authentication, #id, @solutionRepository)")
    public ResponseEntity<Void> deleteSolution(@PathVariable UUID id) {
        solutionService.deleteSolution(id);
        return ResponseEntity.noContent().build();
    }
}
