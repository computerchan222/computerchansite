package com.yourapp.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class NftService {
    
    private JdbcTemplate subsquidJdbcTemplate;
    
    @Value("${subsquid.db.url:jdbc:postgresql://localhost:5433/postgres}")
    private String subsquidDbUrl;
    
    @Value("${subsquid.db.username:postgres}")
    private String subsquidDbUsername;
    
    @Value("${subsquid.db.password:postgres}")
    private String subsquidDbPassword;
    
    @PostConstruct
    public void init() {
        // Create a separate JDBC template for the Subsquid database
        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setDriverClassName("org.postgresql.Driver");
        dataSource.setUrl(subsquidDbUrl);
        dataSource.setUsername(subsquidDbUsername);
        dataSource.setPassword(subsquidDbPassword);
        
        this.subsquidJdbcTemplate = new JdbcTemplate(dataSource);
        
        System.out.println("SubsquidNftService initialized with URL: " + subsquidDbUrl);
    }
    
    /**
     * Check if a wallet owns any NFTs
     */
    public boolean ownsNft(String walletAddress) {
        return getNftCount(walletAddress) > 0;
    }
    
    /**
     * Get the count of NFTs owned by a wallet
     */
    public int getNftCount(String walletAddress) {
        try {
            String sql = "SELECT COUNT(*) FROM nft_owners WHERE LOWER(owner_id) = LOWER(?)";
            Integer count = subsquidJdbcTemplate.queryForObject(sql, Integer.class, walletAddress);
            return count != null ? count : 0;
        } catch (Exception e) {
            System.err.println("Error getting NFT count for " + walletAddress + ": " + e.getMessage());
            return 0;
        }
    }
    
    /**
     * Get all NFT token IDs owned by a wallet
     */
    public List<BigInteger> getNftTokenIds(String walletAddress, int limit) {
        List<BigInteger> tokenIds = new ArrayList<>();
        try {
            String sql = "SELECT nft_id FROM nft_owners WHERE LOWER(owner_id) = LOWER(?) ORDER BY nft_id::integer ASC";
            
            List<Map<String, Object>> results = subsquidJdbcTemplate.queryForList(sql, walletAddress);
            
            for (Map<String, Object> row : results) {
                String id = (String) row.get("nft_id");
                if (id != null) {
                    tokenIds.add(new BigInteger(id));
                }
                if (tokenIds.size() >= limit) break;
            }
        } catch (Exception e) {
            System.err.println("Error getting NFT token IDs for " + walletAddress + ": " + e.getMessage());
        }
        return tokenIds;
    }
    
    /**
     * Get detailed NFT information for a wallet
     */
    public NftHolderInfo getNftHolderInfo(String walletAddress) {
        NftHolderInfo info = new NftHolderInfo();
        info.setWalletAddress(walletAddress);
        
        try {
            // Get all NFT IDs owned by this wallet from nft_owners table
            String sql = "SELECT nft_id FROM nft_owners WHERE LOWER(owner_id) = LOWER(?) ORDER BY nft_id::integer ASC";
            List<Map<String, Object>> results = subsquidJdbcTemplate.queryForList(sql, walletAddress);
            
            List<Integer> nftIds = new ArrayList<>();
            for (Map<String, Object> row : results) {
                String id = (String) row.get("nft_id");
                if (id != null) {
                    try {
                        nftIds.add(Integer.parseInt(id));
                    } catch (NumberFormatException e) {
                        System.err.println("Skipping non-numeric NFT ID: " + id);
                    }
                }
            }
            
            info.setNftIds(nftIds);
            info.setNftCount(nftIds.size());
            info.setHasNft(nftIds.size() > 0);
            
            // If they own NFTs, get the first one for profile display
            if (!nftIds.isEmpty()) {
                info.setPrimaryNftId(nftIds.get(0));
            }
            
            System.out.println("Found " + nftIds.size() + " NFTs for wallet: " + walletAddress);
            
        } catch (Exception e) {
            System.err.println("Error getting holder info for " + walletAddress + ": " + e.getMessage());
            e.printStackTrace();
            info.setNftCount(0);
            info.setHasNft(false);
            info.setNftIds(new ArrayList<>());
        }
        
        return info;
    }
    
    /**
     * Helper class to hold NFT holder information
     */
    public static class NftHolderInfo {
        private String walletAddress;
        private boolean hasNft;
        private int nftCount;
        private List<Integer> nftIds;
        private Integer primaryNftId; // For profile display
        
        // Getters and setters
        public String getWalletAddress() { return walletAddress; }
        public void setWalletAddress(String walletAddress) { this.walletAddress = walletAddress; }
        
        public boolean isHasNft() { return hasNft; }
        public void setHasNft(boolean hasNft) { this.hasNft = hasNft; }
        
        public int getNftCount() { return nftCount; }
        public void setNftCount(int nftCount) { this.nftCount = nftCount; }
        
        public List<Integer> getNftIds() { return nftIds; }
        public void setNftIds(List<Integer> nftIds) { this.nftIds = nftIds; }
        
        public Integer getPrimaryNftId() { return primaryNftId; }
        public void setPrimaryNftId(Integer primaryNftId) { this.primaryNftId = primaryNftId; }
    }
} 