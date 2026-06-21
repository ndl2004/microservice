package com.example.user;

public class AuthResponse {
    private String token;
    private Long userId;
    private String email;
    private String fullName;

    public AuthResponse(String token, Long userId, String email, String fullName) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.fullName = fullName;
    }

    public String getToken() { return token; }
    public Long getUserId() { return userId; }
    public String getEmail() { return email; }
    public String getFullName() { return fullName; }
}