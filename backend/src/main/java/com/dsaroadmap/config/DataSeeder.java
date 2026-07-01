package com.dsaroadmap.config;

import com.dsaroadmap.models.*;
import com.dsaroadmap.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ConceptRepository conceptRepository;
    private final ProblemRepository problemRepository;
    private final SolutionRepository solutionRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        seedAdminUser();
        if (conceptRepository.count() == 0) {
            seedConceptsAndProblems();
        }
    }

    private void seedAdminUser() {
        // Create default admin if doesn't exist
        Optional<User> adminOpt = userRepository.findByEmail("admin@dsaroadmap.com");
        if (adminOpt.isEmpty()) {
            User admin = User.builder()
                    .name("Admin")
                    .email("admin@dsaroadmap.com")
                    .password(passwordEncoder.encode("Admin123"))
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
        }

        if (userRepository.findByEmail("2300031222cseh1@gmail.com").isEmpty()) {
            User satya = User.builder()
                    .name("Satya")
                    .email("2300031222cseh1@gmail.com")
                    .password(passwordEncoder.encode("Test1234"))
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(satya);
        }

        // Promote specific emails to ADMIN role
        List<String> adminEmails = List.of(
                "2300031222cseh1@gmail.com",
                "satyasaivanapalli47@gmail.com"
        );
        for (String email : adminEmails) {
            userRepository.findByEmail(email).ifPresent(user -> {
                if (user.getRole() != Role.ADMIN) {
                    user.setRole(Role.ADMIN);
                    userRepository.save(user);
                }
            });
        }
    }

    private void seedConceptsAndProblems() {
        String[] conceptNames = {
                "Arrays & Hashing", "Two Pointers", "Sliding Window", "Stack", "Binary Search", 
                "Linked List", "Trees", "Tries", "Heap / Priority Queue", "Backtracking", 
                "Graphs", "Advanced Graphs", "1-D Dynamic Programming", "2-D Dynamic Programming", 
                "Greedy", "Intervals", "Math & Geometry", "Bit Manipulation"
        };

        for (String name : conceptNames) {
            Concept concept = Concept.builder().name(name).build();
            conceptRepository.save(concept);

            // Add sample problems for some concepts
            if (name.equals("Arrays & Hashing")) {
                createProblem(concept, "Two Sum", "Easy", "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.");
                createProblem(concept, "Valid Anagram", "Easy", "Given two strings s and t, return true if t is an anagram of s, and false otherwise.");
                createProblem(concept, "Group Anagrams", "Medium", "Given an array of strings strs, group the anagrams together. You can return the answer in any order.");
                createProblem(concept, "Top K Frequent Elements", "Medium", "Given an integer array nums and an integer k, return the k most frequent elements. You may return the answer in any order.");
            } else if (name.equals("Two Pointers")) {
                createProblem(concept, "Valid Palindrome", "Easy", "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.");
                createProblem(concept, "3Sum", "Medium", "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.");
                createProblem(concept, "Container With Most Water", "Medium", "You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]).");
            } else if (name.equals("Linked List")) {
                createProblem(concept, "Reverse Linked List", "Easy", "Given the head of a singly linked list, reverse the list, and return the reversed list.");
                createProblem(concept, "Merge Two Sorted Lists", "Easy", "You are given the heads of two sorted linked lists list1 and list2. Merge the two lists into one sorted list.");
                createProblem(concept, "Linked List Cycle", "Easy", "Given head, the head of a linked list, determine if the linked list has a cycle in it.");
            }
        }
    }

    private void createProblem(Concept concept, String title, String difficulty, String description) {
        Problem problem = Problem.builder()
                .title(title)
                .difficulty(difficulty)
                .description(description)
                .concept(concept)
                .build();
        problem = problemRepository.save(problem);

        if (title.equals("Two Sum")) {
            Solution solutionJava = Solution.builder()
                    .language("Java")
                    .solutionCode("class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) {\n                return new int[] { map.get(complement), i };\n            }\n            map.put(nums[i], i);\n        }\n        return new int[] {};\n    }\n}")
                    .approach("Use a HashMap to store the numbers and their indices. For each number, check if the complement (target - number) exists in the map.")
                    .timeComplexity("O(N)")
                    .spaceComplexity("O(N)")
                    .problem(problem)
                    .build();
            solutionRepository.save(solutionJava);
            
            Solution solutionPython = Solution.builder()
                    .language("Python")
                    .solutionCode("class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        prevMap = {} # val -> index\n        \n        for i, n in enumerate(nums):\n            diff = target - n\n            if diff in prevMap:\n                return [prevMap[diff], i]\n            prevMap[n] = i")
                    .approach("Use a dictionary to store the numbers and their indices. For each number, check if the complement (target - number) exists in the dictionary.")
                    .timeComplexity("O(N)")
                    .spaceComplexity("O(N)")
                    .problem(problem)
                    .build();
            solutionRepository.save(solutionPython);
        }
    }
}
