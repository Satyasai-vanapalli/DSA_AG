package com.dsaroadmap.controllers;

import com.dsaroadmap.models.Motivation;
import com.dsaroadmap.repositories.MotivationRepository;
import com.dsaroadmap.services.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.Map;
import java.util.stream.Collectors;

import com.dsaroadmap.dto.MotivationDTO;
import com.dsaroadmap.dto.CommentDTO;
import com.dsaroadmap.dto.MotivationViewDTO;
import com.dsaroadmap.models.MotivationLike;
import com.dsaroadmap.models.MotivationComment;
import com.dsaroadmap.models.MotivationView;
import com.dsaroadmap.models.User;
import com.dsaroadmap.repositories.MotivationLikeRepository;
import com.dsaroadmap.repositories.MotivationCommentRepository;
import com.dsaroadmap.repositories.MotivationViewRepository;
import com.dsaroadmap.repositories.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MotivationController {

    private final MotivationRepository motivationRepository;
    private final FileStorageService fileStorageService;
    private final MotivationLikeRepository likeRepository;
    private final MotivationCommentRepository commentRepository;
    private final MotivationViewRepository viewRepository;
    private final UserRepository userRepository;

    @GetMapping("/motivation")
    public ResponseEntity<List<MotivationDTO>> getActiveMotivations() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = null;
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            currentUser = userRepository.findByEmail(auth.getName()).orElse(null);
            if (currentUser != null) {
                // Record view
                MotivationView view = viewRepository.findByUserId(currentUser.getId())
                        .orElse(MotivationView.builder().user(currentUser).build());
                // UpdateTimestamp handles the time automatically on save
                viewRepository.save(view);
            }
        }

        final User finalUser = currentUser;
        List<Motivation> activeMotivations = motivationRepository.findByIsActiveOrderByCreatedAtDesc(true);
        
        List<MotivationDTO> dtos = activeMotivations.stream().map(m -> {
            int likesCount = likeRepository.countByMotivationId(m.getId());
            int commentsCount = commentRepository.countByMotivationId(m.getId());
            boolean isLiked = false;
            if (finalUser != null) {
                isLiked = likeRepository.findByMotivationIdAndUserId(m.getId(), finalUser.getId()).isPresent();
            }

            List<CommentDTO> comments = commentRepository.findByMotivationIdOrderByCreatedAtAsc(m.getId()).stream()
                    .map(c -> CommentDTO.builder()
                            .id(c.getId())
                            .content(c.getContent())
                            .userName(c.getUser().getName())
                            .createdAt(c.getCreatedAt())
                            .isOwner(finalUser != null && finalUser.getId().equals(c.getUser().getId()))
                            .build())
                    .collect(Collectors.toList());

            List<String> likedBy = likeRepository.findByMotivationId(m.getId()).stream()
                    .map(like -> like.getUser().getName())
                    .collect(Collectors.toList());

            return MotivationDTO.builder()
                    .id(m.getId())
                    .type(m.getType())
                    .content(m.getContent())
                    .author(m.getAuthor())
                    .isActive(m.isActive())
                    .createdAt(m.getCreatedAt())
                    .likesCount(likesCount)
                    .commentsCount(commentsCount)
                    .isLikedByCurrentUser(isLiked)
                    .likedBy(likedBy)
                    .comments(comments)
                    .build();
        }).collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }
    
    @PostMapping("/motivation/{id}/like")
    public ResponseEntity<Void> toggleLike(@PathVariable UUID id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(auth.getName()).orElseThrow();
        Motivation motivation = motivationRepository.findById(id).orElseThrow();
        
        likeRepository.findByMotivationIdAndUserId(id, currentUser.getId()).ifPresentOrElse(
            like -> likeRepository.delete(like),
            () -> likeRepository.save(MotivationLike.builder().motivation(motivation).user(currentUser).build())
        );
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/motivation/{id}/comment")
    public ResponseEntity<CommentDTO> addComment(@PathVariable UUID id, @RequestBody Map<String, String> payload) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(auth.getName()).orElseThrow();
        Motivation motivation = motivationRepository.findById(id).orElseThrow();
        
        MotivationComment comment = MotivationComment.builder()
            .motivation(motivation)
            .user(currentUser)
            .content(payload.get("content"))
            .build();
            
        comment = commentRepository.save(comment);
        
        return ResponseEntity.ok(CommentDTO.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .userName(currentUser.getName())
                .createdAt(comment.getCreatedAt())
                .isOwner(true)
                .build());
    }
    
    @DeleteMapping("/motivation/{id}/comment/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable UUID id, @PathVariable UUID commentId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(auth.getName()).orElseThrow();
        
        MotivationComment comment = commentRepository.findById(commentId).orElseThrow();
        if (!comment.getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(403).build(); // Only owner can delete
        }
        
        commentRepository.delete(comment);
        return ResponseEntity.ok().build();
    }

    // Only Super Admins or MOTIVATION category admins can access these
    @PreAuthorize("hasRole('ADMIN') or @categorySecurity.canEdit(authentication, 'MOTIVATION')")
    @GetMapping("/admin/motivation")
    public ResponseEntity<List<Motivation>> getAllMotivations() {
        return ResponseEntity.ok(motivationRepository.findAllByOrderByCreatedAtDesc());
    }

    @PreAuthorize("hasRole('ADMIN') or @categorySecurity.canEdit(authentication, 'MOTIVATION')")
    @PostMapping("/admin/motivation/upload")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        String fileUrl = fileStorageService.saveFile(file);
        return ResponseEntity.ok(Map.of("url", fileUrl));
    }

    @PreAuthorize("hasRole('ADMIN') or @categorySecurity.canEdit(authentication, 'MOTIVATION')")
    @PostMapping("/admin/motivation")
    public ResponseEntity<Motivation> createMotivation(@RequestBody Motivation motivation) {
        return ResponseEntity.ok(motivationRepository.save(motivation));
    }

    @PreAuthorize("hasRole('ADMIN') or @categorySecurity.canEdit(authentication, 'MOTIVATION')")
    @PutMapping("/admin/motivation/{id}")
    public ResponseEntity<Motivation> updateMotivation(@PathVariable UUID id, @RequestBody Motivation motivation) {
        Motivation existing = motivationRepository.findById(id).orElseThrow();
        existing.setType(motivation.getType());
        existing.setContent(motivation.getContent());
        existing.setAuthor(motivation.getAuthor());
        existing.setActive(motivation.isActive());
        return ResponseEntity.ok(motivationRepository.save(existing));
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN') or @categorySecurity.canEdit(authentication, 'MOTIVATION')")
    @DeleteMapping("/admin/motivation/{id}")
    public ResponseEntity<Void> deleteMotivation(@PathVariable UUID id) {
        Motivation motivation = motivationRepository.findById(id).orElseThrow();
        if (motivation.getType().equals("IMAGE") || motivation.getType().equals("VIDEO")) {
            fileStorageService.deleteFile(motivation.getContent());
        }
        likeRepository.deleteByMotivationId(id);
        commentRepository.deleteByMotivationId(id);
        motivationRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN') or @categorySecurity.canEdit(authentication, 'MOTIVATION')")
    @GetMapping("/admin/motivation/views")
    public ResponseEntity<List<MotivationViewDTO>> getMotivationViews() {
        List<MotivationViewDTO> views = viewRepository.findAllByOrderByLastViewedAtDesc().stream()
            .map(v -> MotivationViewDTO.builder()
                .userName(v.getUser().getName())
                .userEmail(v.getUser().getEmail())
                .lastViewedAt(v.getLastViewedAt())
                .build())
            .collect(Collectors.toList());
        return ResponseEntity.ok(views);
    }
}
