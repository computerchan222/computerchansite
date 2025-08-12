package com.yourapp.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

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
        try {
            // Create a minimal HikariCP connection pool for Subsquid database
            HikariConfig config = new HikariConfig();
            config.setJdbcUrl(subsquidDbUrl);
            config.setUsername(subsquidDbUsername);
            config.setPassword(subsquidDbPassword);
            
            // CRITICAL: Minimal connection pool for Supabase limits
            config.setMaximumPoolSize(1); // Only 1 connection for Subsquid
            config.setMinimumIdle(0);     // No idle connections
            config.setConnectionTimeout(30000); // 30 seconds
            config.setIdleTimeout(600000);      // 10 minutes
            config.setMaxLifetime(1800000);     // 30 minutes
            
            // Additional Supabase optimizations
            config.setLeakDetectionThreshold(60000); // 1 minute leak detection
            config.setConnectionTestQuery("SELECT 1");
            
            HikariDataSource dataSource = new HikariDataSource(config);
            this.subsquidJdbcTemplate = new JdbcTemplate(dataSource);
            
            System.out.println("SubsquidNftService initialized with minimal connection pool");
            
            // Test the connection
            subsquidJdbcTemplate.queryForObject("SELECT 1", Integer.class);
            System.out.println("Subsquid database connection successful");
        } catch (Exception e) {
            System.err.println("Warning: Could not connect to Subsquid database: " + e.getMessage());
            System.err.println("NFT functionality will be limited. Using fallback data.");
            this.subsquidJdbcTemplate = null;
        }
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
        if (subsquidJdbcTemplate == null) {
            System.out.println("Subsquid database not available, returning 0 NFT count");
            return 0;
        }
        
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
        
        if (subsquidJdbcTemplate == null) {
            System.out.println("Subsquid database not available, returning empty NFT info for: " + walletAddress);
            info.setNftCount(0);
            info.setHasNft(false);
            info.setNftIds(new ArrayList<>());
            return info;
        }
        
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