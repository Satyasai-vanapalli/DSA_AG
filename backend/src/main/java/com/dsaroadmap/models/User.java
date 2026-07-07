package com.dsaroadmap.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private java.util.List<UserProgress> progress = new java.util.ArrayList<>();

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(name = "current_streak", nullable = false)
    @Builder.Default
    private Integer currentStreak = 0;

    @Column(name = "max_streak", nullable = false)
    @Builder.Default
    private Integer maxStreak = 0;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_admin_categories", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "category")
    private java.util.Set<String> adminCategories = new java.util.HashSet<>();

    private LocalDateTime lastActiveTime;

    @Column(name = "profile_picture_url")
    private String profilePictureUrl;

    @Column(name = "total_active_days", nullable = false, columnDefinition = "integer default 0")
    @Builder.Default
    private Integer totalActiveDays = 0;

    @Column(name = "last_active_date")
    private LocalDate lastActiveDate;

    @Column(nullable = false, columnDefinition = "integer default 1")
    @Builder.Default
    private Integer tokenVersion = 1;

    @Column(nullable = false, columnDefinition = "boolean default false")
    @Builder.Default
    private boolean isBlocked = false;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
