// Multi-chain configuration for EVM compatibility
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, arbitrum, optimism, base, bsc } from 'wagmi/chains';

// Create the actual wagmi config using getDefaultConfig
export const config = getDefaultConfig({
  appName: 'ComputerChan NFT',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '241c889f841233d934a0ba78c1089ac3',
  chains: [mainnet, polygon, arbitrum, optimism, base, bsc], // Multi-chain support
  ssr: false,
  // Additional configuration for better multi-chain support
  walletConnectParameters: {
    projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '241c889f841233d934a0ba78c1089ac3',
    metadata: {
      name: 'ComputerChan NFT',
      description: 'ComputerChan NFT Collection - Multi-chain Support',
      url: 'https://computerchansite.vercel.app',
      icons: ['https://computerchansite.vercel.app/favicon.ico']
    }
  }
});
