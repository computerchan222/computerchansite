import { BACKEND_URL } from '../config/constants';

// API service for backend communication
export const authAPI = {
  // Get nonce for signature
  async getNonce(address) {
    try {
      console.log('API: Getting nonce for address:', address);
      const response = await fetch(`${BACKEND_URL}/api/auth/nonce?address=${address}`);
      console.log('API: Nonce response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API: Nonce response data:', data);
      return data.nonce;
    } catch (error) {
      console.error('API: Error getting nonce:', error);
      throw error;
    }
  },

  // Verify signature
  async verifySignature(address, message, signature) {
    try {
      console.log('API: Verifying signature for address:', address);
      console.log('API: Message:', message);
      console.log('API: Signature:', signature);
      
      const response = await fetch(`${BACKEND_URL}/api/auth/verify-signature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, message, signature })
      });
      
      console.log('API: Verify signature response status:', response.status);
      console.log('API: Verify signature response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API: HTTP error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('API: Verify signature response data:', data);
      return data;
    } catch (error) {
      console.error('API: Error verifying signature:', error);
      throw error;
    }
  },

  // Get user profile
  async getUserProfile(address) {
    try {
      console.log('API: Getting user profile for address:', address);
      const response = await fetch(`${BACKEND_URL}/api/user/profile?address=${address}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API: User profile response data:', data);
      return data;
    } catch (error) {
      console.error('API: Error getting user profile:', error);
      throw error;
    }
  },

  // Update primary NFT
  async updatePrimaryNFT(address, nftId) {
    try {
      console.log('API: Updating primary NFT for address:', address, 'NFT ID:', nftId);
      const response = await fetch(`${BACKEND_URL}/api/user/primary-nft`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, nftId })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API: Update primary NFT response data:', data);
      return data;
    } catch (error) {
      console.error('API: Error updating primary NFT:', error);
      throw error;
    }
  }
};

// Utility function to create login message
export const createLoginMessage = (address, nonce) => {
  return `Login to ComputerChan\nAddress: ${address}\nNonce: ${nonce}`;
};
