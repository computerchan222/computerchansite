package com.yourapp.controllers;

import com.yourapp.models.User;
import com.yourapp.services.AuthService;
import com.yourapp.services.NonceService;
import com.yourapp.services.UserService;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "file://"})
public class AuthController {

    private final AuthService authService;
    private final NonceService nonceService;
    private final UserService userService;

    public AuthController(AuthService authService, NonceService nonceService, UserService userService) {
        this.authService = authService;
        this.nonceService = nonceService;
        this.userService = userService;
    }

    @GetMapping("/ping")
    public ResponseEntity<?> ping() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "ok");
        response.put("message", "Backend is running!");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/nonce")
    public ResponseEntity<?> getNonce(@RequestParam String address) {
        String nonce = nonceService.generateNonce(address);
        Map<String, Object> response = new HashMap<>();
        response.put("nonce", nonce);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-signature")
    public ResponseEntity<?> verifySignature(@RequestBody SignatureRequest request) {
        // Extract nonce from message
        String nonce = extractNonceFromMessage(request.getMessage());
        if (!nonceService.validateNonce(request.getAddress(), nonce)) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid or expired nonce");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }

        boolean isValid = authService.verifySignature(request.getMessage(), request.getSignature(), request.getAddress());
        if (!isValid) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid signature");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }

        // Create or update user in database with NFT data from Subsquid
        User user = userService.createOrUpdateUser(request.getAddress());

        Map<String, Object> successResponse = new HashMap<>();
        successResponse.put("success", true);
        successResponse.put("address", user.getAddress());
        successResponse.put("lastLogin", user.getLastLogin());
        successResponse.put("createdAt", user.getCreatedAt());
        
        // NFT ownership data
        successResponse.put("hasNft", user.getHasNft());
        successResponse.put("nftCount", user.getNftCount());
        successResponse.put("nftTokens", user.getNftTokens());
        
        // Profile customization data
        successResponse.put("primaryNftId", user.getPrimaryNftId());
        successResponse.put("holderTier", user.getHolderTier());
        successResponse.put("profileBackground", user.getProfileBackground());
        successResponse.put("profileBadge", user.getProfileBadge());
        
        // Add NFT image URL if they have a primary NFT
        if (user.getPrimaryNftId() != null) {
            // Assuming your NFT images are stored at /assets/nfts/{id}.png
            successResponse.put("nftImageUrl", "/assets/nfts/" + user.getPrimaryNftId() + ".png");
        }
        
        return ResponseEntity.ok(successResponse);
    }
    
    @GetMapping("/profile/{address}")
    public ResponseEntity<?> getProfile(@PathVariable String address) {
        User user = userService.getUserByAddress(address);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
        }
        
        Map<String, Object> profile = new HashMap<>();
        profile.put("address", user.getAddress());
        profile.put("hasNft", user.getHasNft());
        profile.put("nftCount", user.getNftCount());
        profile.put("primaryNftId", user.getPrimaryNftId());
        profile.put("holderTier", user.getHolderTier());
        profile.put("profileBackground", user.getProfileBackground());
        
        if (user.getPrimaryNftId() != null) {
            profile.put("nftImageUrl", "/assets/nfts/" + user.getPrimaryNftId() + ".png");
        }
        
        return ResponseEntity.ok(profile);
    }

    private String extractNonceFromMessage(String message) {
        for (String line : message.split("\n")) {
            if (line.startsWith("Nonce:")) {
                return line.split(":")[1].trim();
            }
        }
        return null;
    }

    @Data
    public static class SignatureRequest {
        private String message;
        private String signature;
        private String address;
    }
}
