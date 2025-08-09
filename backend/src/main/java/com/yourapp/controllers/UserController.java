package com.yourapp.controllers;

import com.yourapp.models.User;
import com.yourapp.services.UserService;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "file://"})
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Update the primary NFT for profile display
     */
    @PutMapping("/primary-nft")
    public ResponseEntity<?> updatePrimaryNft(@RequestBody UpdatePrimaryNftRequest request) {
        User user = userService.updatePrimaryNft(request.getAddress(), request.getNftId());
        
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "User not found or doesn't own this NFT"));
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("primaryNftId", user.getPrimaryNftId());
        response.put("message", "Primary NFT updated successfully");
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get user profile by address
     */
    @GetMapping("/profile/{address}")
    public ResponseEntity<?> getUserProfile(@PathVariable String address) {
        User user = userService.getUserByAddress(address);
        
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "User not found"));
        }
        
        Map<String, Object> profile = new HashMap<>();
        profile.put("address", user.getAddress());
        profile.put("hasNft", user.getHasNft());
        profile.put("nftCount", user.getNftCount());
        profile.put("nftTokens", user.getNftTokens());
        profile.put("primaryNftId", user.getPrimaryNftId());
        profile.put("holderTier", user.getHolderTier());
        profile.put("profileBackground", user.getProfileBackground());
        profile.put("profileBadge", user.getProfileBadge());
        profile.put("createdAt", user.getCreatedAt());
        profile.put("lastLogin", user.getLastLogin());
        
        return ResponseEntity.ok(profile);
    }
    
    /**
     * Refresh NFT data from Subsquid database
     */
    @PostMapping("/refresh-nfts/{address}")
    public ResponseEntity<?> refreshNftData(@PathVariable String address) {
        User user = userService.createOrUpdateUser(address);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("hasNft", user.getHasNft());
        response.put("nftCount", user.getNftCount());
        response.put("nftTokens", user.getNftTokens());
        response.put("message", "NFT data refreshed from blockchain");
        
        return ResponseEntity.ok(response);
    }
    
    @Data
    public static class UpdatePrimaryNftRequest {
        private String address;
        private Integer nftId;
    }
} 