package com.dsaroadmap.dto;
import lombok.Data;
import lombok.AllArgsConstructor;
import com.dsaroadmap.models.Role;
import java.util.UUID;
@Data @AllArgsConstructor public class AuthResponse {
    private String token;
    private String refreshToken;
    private UUID userId;
    private String name;
    private String email;
    private Role role;
    private java.util.Set<String> adminCategories;
}
