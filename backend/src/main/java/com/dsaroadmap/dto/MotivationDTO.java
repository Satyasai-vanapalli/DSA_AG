package com.dsaroadmap.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MotivationDTO {
    private UUID id;
    private String type;
    private String content;
    private String author;
    @JsonProperty("isActive")
    private boolean isActive;
    private LocalDateTime createdAt;
    
    private int likesCount;
    private int commentsCount;
    @JsonProperty("isLikedByCurrentUser")
    private boolean isLikedByCurrentUser;
    private List<String> likedBy;
    private List<CommentDTO> comments;
}
