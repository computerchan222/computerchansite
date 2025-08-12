// Application constants and configuration
// Production configuration for Vercel deployment
export const BACKEND_URL = 'https://computerchansite-production.up.railway.app';
export const IPFS_GATEWAY = 'https://ipfs.io/ipfs/bafybeife2agzsl2xgnljiiqw732nqfhipfhgnyihwlghmj3esimhzngjce';
export const IPFS_BACKGROUNDS = import.meta.env.VITE_IPFS_BACKGROUNDS || 'YOUR_NEW_IPFS_HASH_FOR_BACKGROUNDS';

// External links
export const EXTERNAL_LINKS = {
  marketplace: 'https://drip.trade/collections/tenshis',
  twitter: 'https://x.com/TenshiOnHL',
  discord: 'https://discord.gg/computerchan',
  docs: 'https://docs.computerchan.com',
};

// Desktop icon configurations
export const DESKTOP_ICONS = [
  { 
    key: "gallery", 
    label: "NFT Gallery", 
    icon: "Image",
    requiresNFT: false 
  },
  { 
    key: "profile", 
    label: "My Profile", 
    icon: "User",
    requiresNFT: false 
  },
  { 
    key: "holders", 
    label: "Holder Portal", 
    icon: "Lock",
    requiresNFT: true 
  },
  { 
    key: "marketplace", 
    label: "Marketplace", 
    icon: "ShoppingCart",
    external: 'https://drip.trade/collections/tenshis'
  },
  { 
    key: "twitter", 
    label: "Twitter", 
    icon: "Twitter",
    external: 'https://x.com/TenshiOnHL'
  },
  { 
    key: "mynfts", 
    label: "My NFTs", 
    icon: "Folder",
    requiresNFT: true 
  },
];
