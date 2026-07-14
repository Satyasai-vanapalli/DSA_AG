package com.dsaroadmap.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MotivationViewDTO {
    private String userName;
    private String userEmail;
    private LocalDateTime lastViewedAt;
}
