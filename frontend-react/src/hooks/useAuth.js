import { useAccount, useSignMessage } from 'wagmi';
import { useState, useEffect } from 'react';
import { authAPI, createLoginMessage } from '../services/api';
import { IPFS_BACKGROUNDS } from '../config/constants';

export function useAuth() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(null);

  // Debug: log what we're getting from backend
  console.log('Profile data:', profile);
  console.log('Holder tier:', profile?.holderTier);

  // Login with signature
  const handleLogin = async () => {
    if (!address) {
      console.log('No address available');
      return;
    }
    
    console.log('Starting login process for address:', address);
    setLoading(true);
    
    try {
      // Get nonce
      console.log('Getting nonce...');
      const nonce = await authAPI.getNonce(address);
      console.log('Nonce received:', nonce);
      
      // Create message
      const message = createLoginMessage(address, nonce);
      console.log('Message to sign:', message);
      
      // Sign message
      console.log('Requesting signature...');
      const signature = await signMessageAsync({ message });
      console.log('Signature received:', signature);
      
      // Verify signature
      console.log('Verifying signature...');
      const result = await authAPI.verifySignature(address, message, signature);
      console.log('Verification result:', result);
      
      if (result.success) {
        console.log('Login successful, setting profile');
        setProfile(result);
        
        // Set background based on primary NFT
        if (result.primaryNftId) {
          setBackgroundImage(`${IPFS_BACKGROUNDS}/${result.primaryNftId}.png`);
        }
      } else {
        console.log('Login failed:', result);
      }
    } catch (error) {
      console.error('Login failed:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        address,
        isConnected
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-login when wallet connects
  useEffect(() => {
    console.log('useEffect triggered:', { isConnected, address });
    
    if (isConnected && address) {
      console.log('Wallet connected, attempting login');
      handleLogin();
    } else {
      console.log('Wallet disconnected or no address, clearing profile');
      setProfile(null);
      setBackgroundImage(null);
    }
  }, [isConnected, address]);

  return { 
    profile, 
    loading, 
    handleLogin, 
    isConnected, 
    address,
    backgroundImage,
    setBackgroundImage
  };
}
