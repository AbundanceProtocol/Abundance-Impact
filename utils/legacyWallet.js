// Legacy wallet contract interaction utilities
// Uses window.farcasterEthProvider directly for contract interactions

import { ethers } from 'ethers';

// ERC20 ABI for token operations
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function symbol() external view returns (string)",
  "function decimals() external view returns (uint8)"
];

// Disperse contract ABI
const DISPERSE_ABI = [
  "function disperseToken(address token, address[] recipients, uint256[] values) external",
  "function disperseEther(address[] recipients, uint256[] values) external payable"
];

// Disperse contract addresses for different networks
const DISPERSE_CONTRACTS = {
  1: '0xD152f549545093347A162Dce210e7293f1452150',    // Ethereum Mainnet
  10: '0xD152f549545093347A162Dce210e7293f1452150',   // Optimism
  250: '0xD152f549545093347A162Dce210e7293f1452150',  // Fantom
  42161: '0xD152f549545093347A162Dce210e7293f1452150', // Arbitrum
  42220: '0xD152f549545093347A162Dce210e7293f1452150'  // Celo
};

// Default disperse contract address (fallback)
const DISPERSE_CONTRACT_ADDRESS = '0xD152f549545093347A162Dce210e7293f1452150';

// Get the legacy wallet provider using proper Farcaster SDK
export async function getLegacyProvider() {
  if (typeof window === 'undefined') {
    throw new Error('Not in browser environment');
  }
  
  try {
    // Use proper Farcaster SDK method
    const { sdk } = await import('@farcaster/miniapp-sdk');
    let farcasterProvider = sdk.wallet.getEthereumProvider();
    
    // Check if provider is a Promise and await it
    if (farcasterProvider && typeof farcasterProvider.then === 'function') {
      console.log('🔄 SDK provider is a Promise, awaiting...');
      farcasterProvider = await farcasterProvider;
    }
    
    if (!farcasterProvider) {
      throw new Error('Farcaster wallet provider not available via SDK');
    }
    
    console.log('✅ Using Farcaster provider via sdk.wallet.getEthereumProvider()');
    return new ethers.providers.Web3Provider(farcasterProvider);
  } catch (error) {
    // Fallback to legacy method
    console.warn('⚠️ SDK method failed, falling back to window.farcasterEthProvider:', error.message);
    if (window.farcasterEthProvider) {
      return new ethers.providers.Web3Provider(window.farcasterEthProvider);
    }
    throw new Error('Farcaster wallet provider not available via SDK or window');
  }
}

// Get the legacy wallet signer
export async function getLegacySigner() {
  const provider = await getLegacyProvider();
  return provider.getSigner();
}

// Get wallet address from legacy wallet
export async function getLegacyAddress() {
  try {
    const signer = await getLegacySigner();
    return await signer.getAddress();
  } catch (error) {
    console.error('Failed to get legacy wallet address:', error);
    throw error;
  }
}

// Get disperse contract address for current network
export async function getDisperseContractAddress() {
  try {
    const provider = await getLegacyProvider();
    const network = await provider.getNetwork();
    const chainId = network.chainId;
    
    console.log(`🌐 Current network chain ID: ${chainId}`);
    
    const disperseAddress = DISPERSE_CONTRACTS[chainId] || DISPERSE_CONTRACT_ADDRESS;
    console.log(`📋 Using disperse contract: ${disperseAddress} for chain ${chainId}`);
    
    return disperseAddress;
  } catch (error) {
    console.warn('⚠️ Failed to get network, using default disperse contract:', error.message);
    return DISPERSE_CONTRACT_ADDRESS;
  }
}

// Check if legacy wallet is connected using proper SDK
export async function isLegacyWalletConnected() {
  if (typeof window === 'undefined') return false;
  
  try {
    const { sdk } = await import('@farcaster/miniapp-sdk');
    const provider = sdk.wallet.getEthereumProvider();
    return !!provider;
  } catch (error) {
    // Fallback to legacy method
    return !!window.farcasterEthProvider;
  }
}

// Read contract function (view/pure functions)
export async function legacyReadContract(contractAddress, abi, functionName, args = []) {
  try {
    console.log(`📖 Legacy read: ${functionName} on ${contractAddress}`);
    const provider = await getLegacyProvider();
    const contract = new ethers.Contract(contractAddress, abi, provider);
    const result = await contract[functionName](...args);
    console.log(`✅ Legacy read result:`, result);
    return result;
  } catch (error) {
    console.error(`❌ Legacy read failed for ${functionName}:`, error);
    throw error;
  }
}

// Write contract function (state-changing functions) - Farcaster compatible
export async function legacyWriteContract(contractAddress, abi, functionName, args = [], options = {}) {
  try {
    console.log(`✍️ Legacy write: ${functionName} on ${contractAddress}`, { args, options });
    
    // For Farcaster provider, use direct provider.request instead of ethers contracts
    // This avoids unsupported methods that ethers.js might try to use
    const { sdk } = await import('@farcaster/miniapp-sdk');
    let provider = sdk.wallet.getEthereumProvider();
    
    // Check if provider is a Promise and await it
    if (provider && typeof provider.then === 'function') {
      provider = await provider;
    }
    
    if (!provider || typeof provider.request !== 'function') {
      throw new Error('Farcaster provider not available or invalid');
    }
    
    // Get the signer address
    const accounts = await provider.request({ method: 'eth_requestAccounts' });
    const from = accounts[0];
    
    // Find the function in ABI to encode the call
    const abiInterface = new ethers.utils.Interface(abi);
    const data = abiInterface.encodeFunctionData(functionName, args);
    
    console.log(`🚀 Sending transaction directly via provider.request...`);
    console.log(`📝 Transaction details:`, {
      to: contractAddress,
      from,
      data: data.substring(0, 20) + '...',
      dataLength: data.length
    });
    
    // Send transaction using provider.request
    const txHash = await provider.request({
      method: 'eth_sendTransaction',
      params: [{
        to: contractAddress,
        from,
        data,
        ...options
      }]
    });
    
    console.log(`🚀 Legacy transaction sent:`, txHash);
    
    // Return a transaction-like object for compatibility
    return {
      hash: txHash,
      wait: async (confirmations = 1) => {
        console.log(`⏳ Waiting for transaction confirmation: ${txHash}`);
        // For now, just return a basic receipt-like object
        // The transaction monitoring can be handled elsewhere
        return {
          transactionHash: txHash,
          status: 1,
          blockNumber: 'pending'
        };
      }
    };
  } catch (error) {
    console.error(`❌ Legacy write failed for ${functionName}:`, error);
    throw error;
  }
}

// ERC20 Token Functions
export const legacyTokenUtils = {
  // Check token allowance
  async getAllowance(tokenAddress, owner, spender) {
    return await legacyReadContract(tokenAddress, ERC20_ABI, 'allowance', [owner, spender]);
  },

  // Check token balance
  async getBalance(tokenAddress, account) {
    return await legacyReadContract(tokenAddress, ERC20_ABI, 'balanceOf', [account]);
  },

  // Approve token spending
  async approve(tokenAddress, spender, amount) {
    return await legacyWriteContract(tokenAddress, ERC20_ABI, 'approve', [spender, amount]);
  },

  // Get token symbol
  async getSymbol(tokenAddress) {
    return await legacyReadContract(tokenAddress, ERC20_ABI, 'symbol');
  },

  // Get token decimals
  async getDecimals(tokenAddress) {
    return await legacyReadContract(tokenAddress, ERC20_ABI, 'decimals');
  }
};

// Disperse Contract Functions
export const legacyDisperseUtils = {
  // Disperse tokens to multiple recipients
  async disperseToken(tokenAddress, recipients, amounts) {
    const disperseAddress = await getDisperseContractAddress();
    console.log(`🚀 Disperse token using contract: ${disperseAddress}`);
    
    return await legacyWriteContract(
      disperseAddress,
      DISPERSE_ABI,
      'disperseToken',
      [tokenAddress, recipients, amounts]
    );
  },

  // Disperse ETH/CELO to multiple recipients
  async disperseEther(recipients, amounts) {
    const disperseAddress = await getDisperseContractAddress();
    const totalValue = amounts.reduce((sum, amount) => sum.add(amount), ethers.BigNumber.from(0));
    
    console.log(`🚀 Disperse ETH/CELO using contract: ${disperseAddress}`);
    console.log(`💰 Total value: ${ethers.utils.formatEther(totalValue)} ETH/CELO`);
    
    return await legacyWriteContract(
      disperseAddress,
      DISPERSE_ABI,
      'disperseEther',
      [recipients, amounts],
      { value: totalValue }
    );
  }
};

// Wait for transaction confirmation
export async function waitForLegacyTransaction(tx, confirmations = 1) {
  try {
    console.log(`⏳ Waiting for transaction confirmation: ${tx.hash}`);
    const receipt = await tx.wait(confirmations);
    console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
    return receipt;
  } catch (error) {
    console.error(`❌ Transaction failed:`, error);
    throw error;
  }
}

// Format amounts for display
export function formatTokenAmount(amount, decimals = 18) {
  return ethers.utils.formatUnits(amount, decimals);
}

// Parse amounts for contract calls
export function parseTokenAmount(amount, decimals = 18) {
  return ethers.utils.parseUnits(amount.toString(), decimals);
}

// Note: Most functions are now async due to proper SDK integration
export default {
  getLegacyProvider,        // async
  getLegacySigner,         // async
  getLegacyAddress,        // async
  getDisperseContractAddress, // async
  isLegacyWalletConnected, // async
  legacyReadContract,      // async
  legacyWriteContract,     // async
  legacyTokenUtils,        // methods are async
  legacyDisperseUtils,     // methods are async
  waitForLegacyTransaction, // async
  formatTokenAmount,       // sync
  parseTokenAmount         // sync
};
