package com.dsaroadmap.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "problems")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Problem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String difficulty; // Easy, Medium, Hard

    private String problemLink;
    private String youtubeLink;
    private String documentationLink;


    private Integer orderIndex = 0;

    private String category = "PRACTICE";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "concept_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "problems"})
    private Concept concept;

    @ManyToMany
    @JoinTable(
        name = "problem_companies",
        joinColumns = @JoinColumn(name = "problem_id"),
        inverseJoinColumns = @JoinColumn(name = "company_id")
    )
    @JsonIgnoreProperties("problems")
    private List<Company> companies = new ArrayList<>();

    @ManyToMany
    @JoinTable(
        name = "problem_topics",
        joinColumns = @JoinColumn(name = "problem_id"),
        inverseJoinColumns = @JoinColumn(name = "topic_id")
    )
    @JsonIgnoreProperties("problems")
    private List<Topic> topics = new ArrayList<>();

    @OneToMany(mappedBy = "problem", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("problem")
    private List<PlatformLink> platformLinks = new ArrayList<>();

    @OneToMany(mappedBy = "problem", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("problem")
    private List<ProblemVideo> videos = new ArrayList<>();

    @OneToMany(mappedBy = "problem", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("problem")
    private List<Solution> solutions = new ArrayList<>();

    @OneToMany(mappedBy = "problem", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<UserProgress> userProgresses = new ArrayList<>();
}
