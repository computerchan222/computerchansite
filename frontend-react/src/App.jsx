import React, { useState, useEffect, useCallback } from "react";
import { 
  Grid, User, Crown, Lock, Info, Trophy, Folder, Image, X, Minus, Square, 
  Wifi, Volume2, Battery, ExternalLink, Twitter, ShoppingCart, Globe
} from "lucide-react";

// Import RainbowKit and wagmi
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider, ConnectButton } from '@rainbow-me/rainbowkit';
import { WagmiProvider, useAccount, useSignMessage } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

// Configuration for RainbowKit
const config = getDefaultConfig({
  appName: 'ComputerChan NFT',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '241c889f841233d934a0ba78c1089ac3',
  chains: [mainnet],
  ssr: false,
});

const queryClient = new QueryClient();

// Backend URL - update after deployment
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
const IPFS_GATEWAY = 'https://ipfs.io/ipfs/bafybeife2agzsl2xgnljiiqw732nqfhipfhgnyihwlghmj3esimhzngjce';
const IPFS_BACKGROUNDS = import.meta.env.VITE_IPFS_BACKGROUNDS || 'YOUR_NEW_IPFS_HASH_FOR_BACKGROUNDS'; // Update tomorrow

// Tier styling
const TIER_STYLES = {
  NONE: { accent: "#0078D4", glow: "rgba(0,120,212,0.2)" },
  BRONZE: { accent: "#CD7F32", glow: "rgba(205,127,50,0.2)" },
  SILVER: { accent: "#C0C0C0", glow: "rgba(192,192,192,0.2)" },
  GOLD: { accent: "#FFB900", glow: "rgba(255,185,0,0.2)" },
  DIAMOND: { accent: "#00D4FF", glow: "rgba(0,212,255,0.3)" },
  WHALE: { accent: "#9400D3", glow: "rgba(148,0,211,0.3)" },
};

// External links
const EXTERNAL_LINKS = {
  marketplace: 'https://drip.trade/collections/tenshis',
  twitter: 'https://x.com/TenshiOnHL',
  discord: 'https://discord.gg/computerchan',
  docs: 'https://docs.computerchan.com',
};

// Desktop Icon Component
const DesktopIcon = ({ label, icon: Icon, onOpen, selected, disabled = false }) => (
  <button
    onClick={onOpen}
    onDoubleClick={onOpen}
    disabled={disabled}
    className={`
      flex flex-col items-center gap-1 p-2 rounded
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10 cursor-pointer'}
      focus:outline-none focus:bg-sky-600/30
      ${selected ? 'bg-sky-600/20 border border-sky-400/50' : ''}
      transition-all duration-150 group w-20
    `}
  >
    <div className="relative">
      <div className="w-12 h-12 flex items-center justify-center rounded bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm border border-white/10 shadow-lg group-hover:shadow-xl transition-shadow">
        <Icon className="w-6 h-6 text-white/90" />
      </div>
    </div>
    <span className="text-xs text-white/90 text-center w-full px-1 py-0.5 rounded bg-black/20 backdrop-blur-sm">
      {label}
    </span>
  </button>
);

// Window Component
const Window = ({ title, icon: Icon, onClose, onMinimize, children, width = "600px" }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  return (
    <div 
      className="absolute bg-zinc-900/95 backdrop-blur-xl rounded-lg shadow-2xl border border-white/10"
      style={{ 
        width, 
        maxWidth: "90vw",
        transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
        top: '50%',
        left: '50%'
      }}
    >
      {/* Title Bar */}
      <div 
        className="flex items-center justify-between h-8 px-3 bg-zinc-800/80 rounded-t-lg border-b border-white/10 cursor-move"
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-white/70" />
          <span className="text-xs text-white/90 select-none">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onMinimize} className="w-7 h-5 flex items-center justify-center hover:bg-white/10 rounded">
            <Minus className="w-3 h-3 text-white/70" />
          </button>
          <button className="w-7 h-5 flex items-center justify-center hover:bg-white/10 rounded">
            <Square className="w-2.5 h-2.5 text-white/70" />
          </button>
          <button onClick={onClose} className="w-7 h-5 flex items-center justify-center hover:bg-red-500/50 rounded">
            <X className="w-3 h-3 text-white/70" />
          </button>
        </div>
      </div>
      {/* Content */}
      <div className="p-4 max-h-[70vh] overflow-auto">
        {children}
      </div>
    </div>
  );
};

// Main OS Component
function ComputerChanOS() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [profile, setProfile] = useState(null);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [openWindows, setOpenWindows] = useState({});
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
  const [loading, setLoading] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(null);

  const theme = TIER_STYLES[profile?.holderTier || "NONE"];
  
  // Debug: log what we're getting from backend
  console.log('Profile data:', profile);
  console.log('Holder tier:', profile?.holderTier);
  console.log('Selected theme:', theme);

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-login when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      handleLogin();
    } else {
      setProfile(null);
      setBackgroundImage(null);
    }
  }, [isConnected, address]);

  // Login with signature
  const handleLogin = async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      // Get nonce
      const nonceRes = await fetch(`${BACKEND_URL}/api/auth/nonce?address=${address}`);
      const { nonce } = await nonceRes.json();
      
      // Create message
      const message = `Login to ComputerChan\nAddress: ${address}\nNonce: ${nonce}`;
      
      // Sign message
      const signature = await signMessageAsync({ message });
      
      // Verify signature
      const verifyRes = await fetch(`${BACKEND_URL}/api/auth/verify-signature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, message, signature })
      });
      
      const result = await verifyRes.json();
      
      if (result.success) {
        setProfile(result);
        
        // Set background based on primary NFT
        if (result.primaryNftId) {
          setBackgroundImage(`${IPFS_BACKGROUNDS}/${result.primaryNftId}.png`);
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const desktopIcons = [
    { 
      key: "gallery", 
      label: "NFT Gallery", 
      icon: Image,
      requiresNFT: false 
    },
    { 
      key: "profile", 
      label: "My Profile", 
      icon: User,
      requiresNFT: false 
    },
    { 
      key: "holders", 
      label: "Holder Portal", 
      icon: Lock,
      requiresNFT: true 
    },
    { 
      key: "marketplace", 
      label: "Marketplace", 
      icon: ShoppingCart,
      external: EXTERNAL_LINKS.marketplace 
    },
    { 
      key: "twitter", 
      label: "Twitter", 
      icon: Twitter,
      external: EXTERNAL_LINKS.twitter 
    },
    { 
      key: "mynfts", 
      label: "My NFTs", 
      icon: Folder,
      requiresNFT: true 
    },
  ];

  const openWindow = (key, external = null) => {
    if (external) {
      window.open(external, '_blank');
    } else {
      setOpenWindows(prev => ({ ...prev, [key]: true }));
    }
    setStartMenuOpen(false);
  };

  const closeWindow = (key) => {
    setOpenWindows(prev => ({ ...prev, [key]: false }));
  };

  // Dynamic background
  const backgroundStyle = backgroundImage ? {
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  } : {
    background: `
      radial-gradient(ellipse 80% 50% at 50% -20%, ${theme?.glow || 'rgba(0,120,212,0.2)'}, transparent),
      radial-gradient(ellipse 80% 50% at 80% 80%, rgba(120,119,198,0.3), transparent),
      linear-gradient(180deg, #0c1929 0%, #151f2e 50%, #1a2332 100%)
    `,
  };

  return (
    <div className="h-screen overflow-hidden relative select-none" style={backgroundStyle}>
      {/* Hero Light Effect */}
      {!backgroundImage && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%]">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent transform rotate-12 translate-y-full animate-pulse" />
          </div>
        </div>
      )}

      {/* Desktop Icons */}
      <div className="absolute top-4 left-4 grid grid-cols-1 gap-2">
        {desktopIcons.map((item) => (
          <DesktopIcon
            key={item.key}
            label={item.label}
            icon={item.icon}
            selected={selectedIcon === item.key}
            disabled={item.requiresNFT && !profile?.hasNft}
            onOpen={() => {
              if (item.requiresNFT && !profile?.hasNft) return;
              setSelectedIcon(item.key);
              openWindow(item.key, item.external);
            }}
          />
        ))}
      </div>

      {/* Gallery Window */}
      {openWindows.gallery && (
        <Window 
          title="NFT Gallery - 2,222 ComputerChan Collection" 
          icon={Image} 
          onClose={() => closeWindow('gallery')}
          onMinimize={() => closeWindow('gallery')}
          width="800px"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Collection Gallery</h2>
              <button 
                onClick={() => window.open(EXTERNAL_LINKS.marketplace, '_blank')}
                className="flex items-center gap-2 px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 text-white text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                View on OpenSea
              </button>
            </div>
            <div className="grid grid-cols-6 gap-3">
              {profile && profile.nftTokens ? (
                profile.nftTokens.split(',').map((nftId) => {
                  const id = nftId.trim();
                  return (
                    <div key={id} className="aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-white/30 transition-all cursor-pointer group">
                      <img 
                        src={`${IPFS_GATEWAY}/${id}.png`} 
                        alt={`NFT #${id}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-600/20 to-blue-600/20"><span class="text-white/50">#${id}</span></div>`;
                        }}
                      />
                    </div>
                  );
                })
              ) : (
                <div className="col-span-6 text-center py-8 text-white/60">
                  {profile ? 'No NFTs owned' : 'Connect wallet to view NFTs'}
                </div>
              )}
            </div>
          </div>
        </Window>
      )}

      {/* Profile Window */}
      {openWindows.profile && (
        <Window 
          title="User Profile" 
          icon={User} 
          onClose={() => closeWindow('profile')}
          onMinimize={() => closeWindow('profile')}
          width="500px"
        >
          <div className="space-y-4 text-white">
            {profile ? (
              <>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-sm text-white/60 mb-1">Wallet Address</p>
                  <p className="font-mono text-sm">{profile.address}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-sm text-white/60">NFTs Owned</p>
                    <p className="text-2xl font-bold">{profile.nftCount || 0}</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-sm text-white/60">Holder Tier</p>
                    <p className="text-2xl font-bold" style={{ color: theme.accent }}>
                      {profile.holderTier || 'NONE'}
                    </p>
                  </div>
                </div>

                {profile.primaryNftId && (
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-sm text-white/60 mb-2">Primary NFT</p>
                    <div className="flex items-center gap-4">
                      <img 
                        src={`${IPFS_GATEWAY}/${profile.primaryNftId}.png`}
                        alt={`NFT #${profile.primaryNftId}`}
                        className="w-20 h-20 rounded-lg border border-white/20"
                      />
                      <div>
                        <p className="font-bold">ComputerChan #{profile.primaryNftId}</p>
                        <button className="mt-2 text-sm text-blue-400 hover:text-blue-300">
                          Change Primary NFT
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-white/60 mb-4">Connect your wallet to view profile</p>
                <div className="flex justify-center">
                  <ConnectButton />
                </div>
              </div>
            )}
          </div>
        </Window>
      )}

      {/* My NFTs Window */}
      {openWindows.mynfts && profile?.hasNft && (
        <Window 
          title="My NFT Collection" 
          icon={Folder} 
          onClose={() => closeWindow('mynfts')}
          onMinimize={() => closeWindow('mynfts')}
          width="700px"
        >
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Your NFTs ({profile.nftCount})</h2>
            <div className="grid grid-cols-4 gap-3">
              {profile.nftTokens?.split(',').map(id => (
                <div 
                  key={id} 
                  className="relative group cursor-pointer"
                  onClick={() => {
                    // Update primary NFT
                    fetch(`${BACKEND_URL}/api/user/primary-nft`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ address: profile.address, nftId: parseInt(id) })
                    }).then(() => handleLogin());
                  }}
                >
                  <div className="aspect-square rounded-lg overflow-hidden border-2 border-white/10 group-hover:border-blue-500/50 transition-all">
                    <img 
                      src={`${IPFS_GATEWAY}/${id.trim()}.png`}
                      alt={`NFT #${id}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs text-white text-center">Set as Primary</p>
                  </div>
                  <span className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-xs text-white">
                    #{id.trim()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Window>
      )}

      {/* Taskbar */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-zinc-900/80 backdrop-blur-xl border-t border-white/10">
        <div className="h-full flex items-center justify-between px-2">
          <div className="flex items-center gap-1">
            {/* Start Button */}
            <button 
              onClick={() => setStartMenuOpen(!startMenuOpen)}
              className="h-10 w-10 flex items-center justify-center hover:bg-white/10 rounded transition-colors"
              style={{ color: theme.accent }}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M3 12V6.75L9 5.43V11.91L3 12M20 3V11.75L10 11.9V5.21L20 3M3 13L9 13.09V19.9L3 18.75V13M20 13.25V22L10 20.09V13.1L20 13.25Z" />
              </svg>
            </button>

            {/* Open Windows */}
            <div className="flex items-center gap-1 px-2 border-l border-white/10">
              {Object.entries(openWindows).filter(([_, open]) => open).map(([key]) => {
                const icon = desktopIcons.find(i => i.key === key);
                if (!icon) return null;
                return (
                  <button
                    key={key}
                    className="h-10 px-3 flex items-center gap-2 bg-white/10 border-b-2 rounded-t"
                    style={{ borderColor: theme.accent }}
                  >
                    <icon.icon className="w-4 h-4 text-white/80" />
                    <span className="text-xs text-white/80">{icon.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* System Tray */}
          <div className="flex items-center gap-3 px-3">
            {/* Wallet Connection */}
            <div className="scale-90">
              <ConnectButton 
                showBalance={false}
                chainStatus="none"
                accountStatus={{
                  smallScreen: 'avatar',
                  largeScreen: 'full',
                }}
              />
            </div>
            
            {/* System Icons */}
            <div className="flex items-center gap-2 text-white/60">
              <Wifi className="w-4 h-4" />
              <Volume2 className="w-4 h-4" />
              <Battery className="w-4 h-4" />
            </div>

            {/* Clock */}
            <div className="text-white/80 text-sm">
              <div>{time}</div>
              <div className="text-xs text-white/60">{new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Start Menu */}
      {startMenuOpen && (
        <div className="absolute bottom-12 left-0 w-80 h-96 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-t-lg shadow-2xl">
          <div className="p-4">
            <div className="mb-4">
              <h3 className="text-white/60 text-xs uppercase tracking-wider mb-2">ComputerChan OS</h3>
              {profile?.hasNft && (
                <div className="p-2 bg-white/5 rounded">
                  <p className="text-xs text-white/60">NFT Holder</p>
                  <p className="text-sm text-white font-bold">{profile.nftCount} NFTs • {profile.holderTier}</p>
                </div>
              )}
            </div>
            <div className="space-y-1">
              <button
                onClick={() => window.open(EXTERNAL_LINKS.marketplace, '_blank')}
                className="w-full text-left px-3 py-2 hover:bg-white/10 rounded flex items-center gap-3 text-white/90"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>NFT Marketplace</span>
              </button>
              <button
                onClick={() => window.open(EXTERNAL_LINKS.twitter, '_blank')}
                className="w-full text-left px-3 py-2 hover:bg-white/10 rounded flex items-center gap-3 text-white/90"
              >
                <Twitter className="w-5 h-5" />
                <span>Follow on Twitter</span>
              </button>
              <button
                onClick={() => window.open(EXTERNAL_LINKS.discord, '_blank')}
                className="w-full text-left px-3 py-2 hover:bg-white/10 rounded flex items-center gap-3 text-white/90"
              >
                <Globe className="w-5 h-5" />
                <span>Join Discord</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Main App with Providers
export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <ComputerChanOS />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
