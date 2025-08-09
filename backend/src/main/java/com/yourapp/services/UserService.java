package com.yourapp.services;

import com.yourapp.models.User;
import com.yourapp.repositories.UserRepository;
import com.yourapp.services.NftService.NftHolderInfo;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final NftService nftService;

    public UserService(UserRepository userRepository, NftService nftService) {
        this.userRepository = userRepository;
        this.nftService = nftService;
    }

    public User createOrUpdateUser(String address) {
        // Get detailed NFT information from Subsquid database
        NftHolderInfo nftInfo = nftService.getNftHolderInfo(address);
        
        // Convert NFT IDs list to string for storage
        String nftTokensString = nftInfo.getNftIds().stream()
            .map(String::valueOf)
            .collect(Collectors.joining(","));
        
        return userRepository.findByAddress(address)
            .map(user -> {
                // Update existing user
                user.setLastLogin(LocalDateTime.now());
                user.setHasNft(nftInfo.isHasNft());
                user.setNftCount(nftInfo.getNftCount());
                user.setNftTokens(nftTokensString);
                user.setPrimaryNftId(nftInfo.getPrimaryNftId());
                
                // Calculate tier based on NFT count
                user.calculateHolderTier();
                
                // Set profile customization based on NFT ownership
                if (nftInfo.isHasNft()) {
                    setProfileCustomization(user, nftInfo);
                }
                
                return userRepository.save(user);
            })
            .orElseGet(() -> {
                // Create new user
                User newUser = new User();
                newUser.setAddress(address);
                newUser.setLastLogin(LocalDateTime.now());
                newUser.setHasNft(nftInfo.isHasNft());
                newUser.setNftCount(nftInfo.getNftCount());
                newUser.setNftTokens(nftTokensString);
                newUser.setPrimaryNftId(nftInfo.getPrimaryNftId());
                
                // Calculate tier
                newUser.calculateHolderTier();
                
                // Set profile customization
                if (nftInfo.isHasNft()) {
                    setProfileCustomization(newUser, nftInfo);
                }
                
                return userRepository.save(newUser);
            });
    }
    
    public User getUserByAddress(String address) {
        return userRepository.findByAddress(address).orElse(null);
    }
    
    /**
     * Set profile customization based on NFT ownership
     */
    private void setProfileCustomization(User user, NftHolderInfo nftInfo) {
        // Set profile background based on tier
        switch (user.getHolderTier()) {
            case "WHALE":
                user.setProfileBackground("linear-gradient(135deg, #667eea 0%, #764ba2 100%)");
                user.setProfileBadge("🐋 WHALE");
                break;
            case "DIAMOND":
                user.setProfileBackground("linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)");
                user.setProfileBadge("💎 DIAMOND");
                break;
            case "GOLD":
                user.setProfileBackground("linear-gradient(135deg, #f093fb 0%, #f5576c 100%)");
                user.setProfileBadge("🏆 GOLD");
                break;
            case "SILVER":
                user.setProfileBackground("linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)");
                user.setProfileBadge("🥈 SILVER");
                break;
            case "BRONZE":
                user.setProfileBackground("linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)");
                user.setProfileBadge("🥉 BRONZE");
                break;
            default:
                user.setProfileBackground(null);
                user.setProfileBadge(null);
        }
        
        // You could also add rarity-based customization here
        // For example, if certain NFT IDs are rare:
        if (nftInfo.getPrimaryNftId() != null) {
            Integer primaryId = nftInfo.getPrimaryNftId();
            
            // Example: NFTs 1-100 are "Genesis" collection
            if (primaryId <= 100) {
                user.setProfileBadge(user.getProfileBadge() + " | GENESIS");
            }
            
            // Example: NFTs with special IDs
            if (primaryId == 1 || primaryId == 777 || primaryId == 2222) {
                user.setProfileBadge(user.getProfileBadge() + " | LEGENDARY");
                user.setProfileBackground("linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)");
            }
        }
    }
    
    /**
     * Update a user's primary NFT (for profile display)
     */
    public User updatePrimaryNft(String address, Integer nftId) {
        return userRepository.findByAddress(address)
            .map(user -> {
                // Verify they own this NFT
                String[] ownedNfts = user.getNftTokens().split(",");
                boolean ownsNft = false;
                for (String nft : ownedNfts) {
                    if (nft.trim().equals(String.valueOf(nftId))) {
                        ownsNft = true;
                        break;
                    }
                }
                
                if (ownsNft) {
                    user.setPrimaryNftId(nftId);
                    return userRepository.save(user);
                }
                
                return user;
            })
            .orElse(null);
    }
} 