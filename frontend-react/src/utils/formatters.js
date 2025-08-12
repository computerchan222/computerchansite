// Utility functions for formatting and common operations

// Format wallet address for display
export const formatAddress = (address, start = 6, end = 4) => {
  if (!address) return '';
  return `${address.slice(0, start)}...${address.slice(-end)}`;
};

// Format NFT ID for display
export const formatNFTId = (id) => {
  if (!id) return '';
  return `#${id.toString().trim()}`;
};

// Get tier color based on holder tier
export const getTierColor = (tier) => {
  const tierColors = {
    NONE: "#0078D4",
    BRONZE: "#CD7F32",
    SILVER: "#C0C0C0",
    GOLD: "#FFB900",
    DIAMOND: "#00D4FF",
    WHALE: "#9400D3",
  };
  return tierColors[tier] || tierColors.NONE;
};

// Check if user has NFTs
export const hasNFTs = (profile) => {
  return profile?.hasNft && profile?.nftCount > 0;
};

// Get NFT count safely
export const getNFTCount = (profile) => {
  return profile?.nftCount || 0;
};

// Get NFT tokens safely
export const getNFTTokens = (profile) => {
  if (!profile?.nftTokens) return [];
  return profile.nftTokens.split(',').map(id => id.trim()).filter(Boolean);
};
