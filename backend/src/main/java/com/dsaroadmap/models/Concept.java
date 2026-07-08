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
@Table(name = "concepts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Concept {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Integer orderIndex = 0;

    private String category = "PRACTICE";
    
    @Column(name = "is_material_only", nullable = false, columnDefinition = "boolean default false")
    @Builder.Default
    private boolean isMaterialOnly = false;

    @Column(name = "parent_id")
    private UUID parentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id", insertable = false, updatable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Concept parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({"parent", "children", "problems", "hibernateLazyInitializer", "handler"})
    @OrderBy("orderIndex ASC")
    private List<Concept> children = new ArrayList<>();

    @OneToMany(mappedBy = "concept", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({"concept", "companies", "topics", "platformLinks", "videos", "solutions"})
    private List<Problem> problems = new ArrayList<>();

    @OneToMany(mappedBy = "concept", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<ConceptProgress> conceptProgresses = new ArrayList<>();
}
