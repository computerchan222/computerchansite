package com.yourapp.services;

import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
public class NftMetadataService {
    
    private static final String IPFS_GATEWAY = "https://ipfs.io/ipfs/bafybeife2agzsl2xgnljiiqw732nqfhipfhgnyihwlghmj3esimhzngjce";
    
    // Your NFTs follow a simple pattern: {id}.png
    public String getNftImageUrl(Integer nftId) {
        // Files are named simply as 0.png, 1.png, 10.png, 925.png, etc.
        return IPFS_GATEWAY + "/" + nftId + ".png";
    }
    
    // Option 4: If names don't follow a pattern, use a mapping
    // You could load this from a JSON file or database
    private static final Map<Integer, String> NFT_FILENAME_MAP = new HashMap<>() {{
        // Add mappings here if needed
        // put(925, "special_name_925.png");
        // put(1, "genesis_1.png");
        // etc.
    }};
    
    public String getNftImageUrlFromMap(Integer nftId) {
        String filename = NFT_FILENAME_MAP.getOrDefault(nftId, nftId + ".png");
        return IPFS_GATEWAY + "/" + filename;
    }
    
    // Get metadata about the NFT (you could expand this)
    public Map<String, Object> getNftMetadata(Integer nftId) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("id", nftId);
        metadata.put("imageUrl", getNftImageUrl(nftId));
        metadata.put("ipfsGateway", IPFS_GATEWAY);
        
        // Add rarity tiers or special attributes
        if (nftId <= 100) {
            metadata.put("rarity", "Genesis");
        } else if (nftId <= 500) {
            metadata.put("rarity", "Rare");
        } else if (nftId <= 1000) {
            metadata.put("rarity", "Uncommon");
        } else {
            metadata.put("rarity", "Common");
        }
        
        return metadata;
    }
} 