// Add WalletConnect & Injected wallets
const providerOptions = {
    injected: {
      display: {
        name: "Browser Wallet",
        description: "MetaMask, Rabby, Phantom EVM"
      },
      package: null
    }
  };
  
  const web3Modal = new window.Web3Modal.default({
    cacheProvider: false,
    providerOptions: providerOptions
  });
  
  // Store user profile data
  let currentUserProfile = null;
  
  async function getNonce(address) {
    const res = await fetch(`/api/auth/nonce?address=${address}`);
    const data = await res.json();
    return data.nonce;
  }

  async function signMessage(signer, address) {
    const nonce = await getNonce(address);
    const message = `Login to My dApp\nAddress: ${address}\nNonce: ${nonce}`;
    const signature = await signer.signMessage(message);
    return { message, signature };
  }

  async function login(address, message, signature) {
    try {
      const response = await fetch("/api/auth/verify-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, message, signature })
      });

      const result = await response.json();
      console.log("Backend response:", result);
      
      if (result.success) {
        // Store profile data
        currentUserProfile = result;
        
        // Update UI with login info
        alert("Login successful: " + result.address);
        document.getElementById("connectWalletBtn").innerText = "Logged in: " + address.slice(0, 6) + "...";
        
        // Handle NFT status and profile customization
        if (result.hasNft) {
          document.body.classList.add('nft-owner');
          console.log("User owns NFT!");
          console.log("NFT Count:", result.nftCount);
          console.log("NFT Token IDs:", result.nftTokens);
          console.log("Holder Tier:", result.holderTier);
          
          // Apply profile customization
          applyProfileCustomization(result);
          
          // Display NFT profile section
          displayNftProfile(result);
        } else {
          document.body.classList.remove('nft-owner');
          console.log("User does not own NFT");
          hideNftProfile();
        }
      } else {
        alert("Login failed: " + (result.error || "Invalid signature"));
      }
    } catch (err) {
      console.error("Backend communication failed:", err);
      alert("Failed to communicate with backend");
    }
  }

  function applyProfileCustomization(profile) {
    // Apply custom background if available
    if (profile.profileBackground) {
      document.body.style.background = profile.profileBackground;
      document.body.classList.add('custom-profile');
    }
    
    // Add tier-based styling
    if (profile.holderTier) {
      document.body.classList.add(`tier-${profile.holderTier.toLowerCase()}`);
    }
  }

  function displayNftProfile(profile) {
    // Remove existing profile if any
    const existingProfile = document.getElementById('nft-profile');
    if (existingProfile) {
      existingProfile.remove();
    }
    
    // Create profile container
    const profileDiv = document.createElement('div');
    profileDiv.id = 'nft-profile';
    profileDiv.className = 'nft-profile-container';
    
    // Build profile HTML
    let profileHTML = `
      <div class="profile-header">
        <h2>NFT Holder Profile</h2>
        ${profile.profileBadge ? `<span class="profile-badge">${profile.profileBadge}</span>` : ''}
      </div>
      <div class="profile-stats">
        <div class="stat">
          <span class="stat-label">NFTs Owned:</span>
          <span class="stat-value">${profile.nftCount}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Holder Tier:</span>
          <span class="stat-value tier-badge">${profile.holderTier || 'NONE'}</span>
        </div>
      </div>
    `;
    
    // Add primary NFT display if available
    if (profile.primaryNftId) {
      // Use public IPFS gateway - no authentication required
      const ipfsGateway = 'https://ipfs.io/ipfs/bafybeife2agzsl2xgnljiiqw732nqfhipfhgnyihwlghmj3esimhzngjce';
      const imageUrl = `${ipfsGateway}/${profile.primaryNftId}.png`;
      
      profileHTML += `
        <div class="primary-nft">
          <h3>Your NFT #${profile.primaryNftId}</h3>
          <div class="nft-image-container">
            <img src="${imageUrl}" 
                 alt="NFT #${profile.primaryNftId}" 
                 class="nft-image"
                 onerror="this.style.backgroundColor='#6366f1'; this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><rect width=%22200%22 height=%22200%22 fill=%22%236366f1%22/><text x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22white%22 font-size=%2248%22>%23${profile.primaryNftId}</text></svg>'"/>
          </div>
        </div>
      `;
    }
    
    // Add NFT grid if multiple NFTs
    if (profile.nftTokens && profile.nftCount > 1) {
      const ipfsGateway = 'https://ipfs.io/ipfs/bafybeife2agzsl2xgnljiiqw732nqfhipfhgnyihwlghmj3esimhzngjce';
      const nftIds = profile.nftTokens.split(',').slice(0, 6); // Show max 6
      profileHTML += `
        <div class="nft-collection">
          <h4>Your Collection</h4>
          <div class="nft-grid">
            ${nftIds.map(id => `
              <div class="nft-item" data-nft-id="${id}">
                <img src="${ipfsGateway}/${id.trim()}.png" 
                     alt="NFT #${id}" 
                     onerror="this.style.backgroundColor='#6366f1'; this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2280%22 height=%2280%22><rect width=%2280%22 height=%2280%22 fill=%22%236366f1%22/><text x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22white%22 font-size=%2220%22>%23${id.trim()}</text></svg>'"
                     onclick="selectPrimaryNft(${id.trim()})"/>
                <span class="nft-id">#${id.trim()}</span>
              </div>
            `).join('')}
          </div>
          ${profile.nftCount > 6 ? `<p class="more-nfts">+${profile.nftCount - 6} more NFTs</p>` : ''}
        </div>
      `;
    }
    
    profileDiv.innerHTML = profileHTML;
    
    // Insert after the connect button
    const button = document.getElementById('connectWalletBtn');
    button.parentNode.insertBefore(profileDiv, button.nextSibling);
  }

  function hideNftProfile() {
    const profileDiv = document.getElementById('nft-profile');
    if (profileDiv) {
      profileDiv.remove();
    }
    document.body.classList.remove('custom-profile');
    document.body.style.background = '';
  }

  async function selectPrimaryNft(nftId) {
    if (!currentUserProfile) return;
    
    try {
      const response = await fetch(`/api/user/primary-nft`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          address: currentUserProfile.address, 
          nftId: nftId 
        })
      });
      
      if (response.ok) {
        // Refresh profile
        await refreshProfile(currentUserProfile.address);
        alert(`NFT #${nftId} is now your primary NFT!`);
      }
    } catch (err) {
      console.error("Failed to update primary NFT:", err);
    }
  }

  async function refreshProfile(address) {
    try {
      const response = await fetch(`/api/auth/profile/${address}`);
      if (response.ok) {
        const profile = await response.json();
        currentUserProfile = profile;
        displayNftProfile(profile);
        applyProfileCustomization(profile);
      }
    } catch (err) {
      console.error("Failed to refresh profile:", err);
    }
  }

  async function connectWallet() {
    try {
      // Update button to show connecting
      document.getElementById("connectWalletBtn").innerText = "Connecting...";
      
      // Connect via Web3Modal
      const providerInstance = await web3Modal.connect();
      
      // Create ethers provider
      const provider = new ethers.providers.Web3Provider(providerInstance);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      
      console.log("Connected address:", address);
      
      // Update button to show signing
      document.getElementById("connectWalletBtn").innerText = "Signing message...";
      
      // Sign message and login
      const { message, signature } = await signMessage(signer, address);
      await login(address, message, signature);
      
    } catch (error) {
      console.error("Error connecting wallet:", error);
      // Reset button text on error
      document.getElementById("connectWalletBtn").innerText = "Connect Wallet";
      
      if (error.code === 4001) {
        alert("You rejected the connection request");
      } else if (error.message) {
        alert("Connection failed: " + error.message);
      }
    }
  }

  // Initialize on page load
  document.addEventListener('DOMContentLoaded', function() {
    const connectBtn = document.getElementById('connectWalletBtn');
    if (connectBtn) {
      connectBtn.addEventListener('click', connectWallet);
    } else {
      console.error("Connect button not found!");
    }
  });
  