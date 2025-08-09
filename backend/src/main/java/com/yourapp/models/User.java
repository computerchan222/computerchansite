package com.yourapp.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 42)
    private String address;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @Column(name = "has_nft")
    private boolean hasNft;

    @Column(name = "nft_count")
    private Integer nftCount = 0;

    @Column(name = "nft_tokens", columnDefinition = "TEXT")
    private String nftTokens;
    
    // New fields for profile customization
    @Column(name = "primary_nft_id")
    private Integer primaryNftId; // The NFT ID to display on their profile
    
    @Column(name = "profile_background")
    private String profileBackground; // Could be color or preset theme based on NFT rarity
    
    @Column(name = "profile_badge")
    private String profileBadge; // Special badge for NFT holders
    
    @Column(name = "holder_tier")
    private String holderTier; // Based on NFT count: WHALE, DIAMOND, GOLD, SILVER, BRONZE

    // Getters & setters
    public Long getId() { return id; }
    
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    
    public LocalDateTime getLastLogin() { return lastLogin; }
    public void setLastLogin(LocalDateTime lastLogin) { this.lastLogin = lastLogin; }
    
    public boolean getHasNft() { return hasNft; }
    public void setHasNft(boolean hasNft) { this.hasNft = hasNft; }
    
    public Integer getNftCount() { return nftCount; }
    public void setNftCount(Integer nftCount) { this.nftCount = nftCount; }
    
    public String getNftTokens() { return nftTokens; }
    public void setNftTokens(String nftTokens) { this.nftTokens = nftTokens; }
    
    public Integer getPrimaryNftId() { return primaryNftId; }
    public void setPrimaryNftId(Integer primaryNftId) { this.primaryNftId = primaryNftId; }
    
    public String getProfileBackground() { return profileBackground; }
    public void setProfileBackground(String profileBackground) { this.profileBackground = profileBackground; }
    
    public String getProfileBadge() { return profileBadge; }
    public void setProfileBadge(String profileBadge) { this.profileBadge = profileBadge; }
    
    public String getHolderTier() { return holderTier; }
    public void setHolderTier(String holderTier) { this.holderTier = holderTier; }
    
    // Helper method to determine tier based on NFT count
    public void calculateHolderTier() {
        if (nftCount == null || nftCount == 0) {
            this.holderTier = null;
        } else if (nftCount >= 50) {
            this.holderTier = "WHALE";
        } else if (nftCount >= 20) {
            this.holderTier = "DIAMOND";
        } else if (nftCount >= 10) {
            this.holderTier = "GOLD";
        } else if (nftCount >= 5) {
            this.holderTier = "SILVER";
        } else {
            this.holderTier = "BRONZE";
        }
    }
} 