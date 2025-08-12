import React, { useState, useEffect } from "react";
import { 
  Grid, User, Crown, Lock, Info, Trophy, Folder, Image, X, Minus, Square, 
  Wifi, Volume2, Battery, ExternalLink, Twitter, ShoppingCart, Globe
} from "lucide-react";
import { ConnectButton } from '@rainbow-me/rainbowkit';

import DesktopIcon from './DesktopIcon';
import Window from '../Windows/Window';
import { useAuth } from '../../hooks/useAuth';
import { useWindowManager } from '../../hooks/useWindowManager';
import { DESKTOP_ICONS, EXTERNAL_LINKS, IPFS_GATEWAY, IPFS_BACKGROUNDS } from '../../config/constants';
import { getBackgroundStyle } from '../../config/themes';

// Icon mapping for dynamic icon rendering
const ICON_MAP = {
  Image, User, Lock, ShoppingCart, Twitter, Folder
};

export default function Desktop() {
  const { profile, backgroundImage } = useAuth();
  const { 
    openWindows, 
    selectedIcon, 
    setSelectedIcon, 
    openWindow, 
    closeWindow, 
    minimizeWindow 
  } = useWindowManager();
  
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleIconClick = (icon) => {
    if (icon.requiresNFT && !profile?.hasNft) return;
    
    setSelectedIcon(icon.key);
    openWindow(icon.key, icon.external);
  };

  const backgroundStyle = getBackgroundStyle(profile, backgroundImage);

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
        {DESKTOP_ICONS.map((item) => {
          const IconComponent = ICON_MAP[item.icon];
          return (
            <DesktopIcon
              key={item.key}
              label={item.label}
              icon={IconComponent}
              selected={selectedIcon === item.key}
              disabled={item.requiresNFT && !profile?.hasNft}
              onOpen={() => handleIconClick(item)}
            />
          );
        })}
      </div>

      {/* Gallery Window */}
      {openWindows.gallery && (
        <Window 
          title="NFT Gallery - 2,222 ComputerChan Collection" 
          icon={Image} 
          onClose={() => closeWindow('gallery')}
          onMinimize={() => minimizeWindow('gallery')}
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
                View on Marketplace
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
          onMinimize={() => minimizeWindow('profile')}
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
                    <p className="text-2xl font-bold" style={{ color: profile.holderTier ? '#0078D4' : '#0078D4' }}>
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
                  <ConnectButton 
                    chainStatus="none"
                    showBalance={false}
                  />
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
          onMinimize={() => minimizeWindow('mynfts')}
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
                    // Update primary NFT functionality would go here
                    console.log('Set as primary:', id.trim());
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
              style={{ color: profile?.holderTier ? '#0078D4' : '#0078D4' }}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M3 12V6.75L9 5.43V11.91L3 12M20 3V11.75L10 11.9V5.21L20 3M3 13L9 13.09V19.9L3 18.75V13M20 13.25V22L10 20.09V13.1L20 13.25Z" />
              </svg>
            </button>

            {/* Open Windows */}
            <div className="flex items-center gap-1 px-2 border-l border-white/10">
              {Object.entries(openWindows).filter(([_, open]) => open).map(([key]) => {
                const icon = DESKTOP_ICONS.find(i => i.key === key);
                if (!icon) return null;
                const IconComponent = ICON_MAP[icon.icon];
                return (
                  <button
                    key={key}
                    className="h-10 px-3 flex items-center gap-2 bg-white/10 border-b-2 rounded-t"
                    style={{ borderColor: profile?.holderTier ? '#0078D4' : '#0078D4' }}
                  >
                    <IconComponent className="w-4 h-4 text-white/80" />
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
