package com.dsaroadmap.security;

import com.dsaroadmap.models.Role;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component("categorySecurity")
public class CategorySecurity {

    public boolean canEdit(Authentication authentication, String category) {
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails)) {
            return false;
        }
        
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        
        // Super Admins can edit anything
        if (userDetails.getUser().getRole() == Role.ADMIN) {
            return true;
        }
        
        // Category Admins can edit their designated categories
        if (category != null && userDetails.getUser().getAdminCategories().contains(category)) {
            return true;
        }
        
        return false;
    }

    public boolean canEditProblem(Authentication authentication, java.util.UUID problemId, com.dsaroadmap.repositories.ProblemRepository repo) {
        com.dsaroadmap.models.Problem p = repo.findById(problemId).orElse(null);
        return p != null && canEdit(authentication, p.getCategory());
    }

    public boolean canEditConcept(Authentication authentication, java.util.UUID conceptId, com.dsaroadmap.repositories.ConceptRepository repo) {
        com.dsaroadmap.models.Concept c = repo.findById(conceptId).orElse(null);
        return c != null && canEdit(authentication, c.getCategory());
    }

    public boolean canEditSolution(Authentication authentication, java.util.UUID solutionId, com.dsaroadmap.repositories.SolutionRepository repo) {
        com.dsaroadmap.models.Solution s = repo.findById(solutionId).orElse(null);
        return s != null && s.getProblem() != null && canEdit(authentication, s.getProblem().getCategory());
    }

    public boolean canReorderConcepts(Authentication authentication, java.util.List<java.util.UUID> conceptIds, com.dsaroadmap.repositories.ConceptRepository repo) {
        if (conceptIds == null || conceptIds.isEmpty()) return true;
        com.dsaroadmap.models.Concept c = repo.findById(conceptIds.get(0)).orElse(null);
        return c != null && canEdit(authentication, c.getCategory());
    }

    public boolean canReorderProblems(Authentication authentication, java.util.List<java.util.UUID> problemIds, com.dsaroadmap.repositories.ProblemRepository repo) {
        if (problemIds == null || problemIds.isEmpty()) return true;
        com.dsaroadmap.models.Problem p = repo.findById(problemIds.get(0)).orElse(null);
        return p != null && canEdit(authentication, p.getCategory());
    }
}
