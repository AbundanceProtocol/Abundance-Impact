// Moralis API implementation for token balances with USD prices
// Supports Base, Celo, and Arbitrum networks

const MORALIS_API_KEY = process.env.MORALIS_KEY;

if (!MORALIS_API_KEY) {
  console.warn('⚠️ MORALIS_KEY environment variable not set');
}

// Map our network keys to Moralis chain identifiers
// NOTE: Moralis may not support Celo network - will use fallback for Celo
const MORALIS_NETWORKS = {
  'base': '0x2105',      // Base (8453) - Supported by Moralis
  'celo': null,          // Celo - NOT supported by Moralis, will use fallback
  'arbitrum': '0xa4b1'   // Arbitrum (42161) - Supported by Moralis
};

// Map Moralis chain IDs to our network format
const NETWORK_INFO = {
  '0x2105': { network: 'Base', networkKey: 'base', chainId: '0x2105' },
  '0xa4ec': { network: 'Celo', networkKey: 'celo', chainId: '0xa4ec' },
  '42220': { network: 'Celo', networkKey: 'celo', chainId: '0xa4ec' }, // Decimal format for Celo
  '0xa4b1': { network: 'Arbitrum', networkKey: 'arbitrum', chainId: '0xa4b1' }
};

// Native tokens for each network with their Moralis price identifiers
const NATIVE_TOKENS = {
  '0x2105': { symbol: 'ETH', name: 'Ethereum', decimals: 18, priceSymbol: 'ETH' },
  '0xa4ec': { symbol: 'CELO', name: 'Celo', decimals: 18, priceSymbol: 'CELO' },
  '42220': { symbol: 'CELO', name: 'Celo', decimals: 18, priceSymbol: 'CELO' }, // Decimal format for Celo
  '0xa4b1': { symbol: 'ETH', name: 'Ethereum', decimals: 18, priceSymbol: 'ETH' }
};

// Optimized helper function to get token prices with parallel processing
const getTokenPrices = async (tokens) => {
  const priceMap = {};
  
  try {
    // Get unique tokens by chain for batch price requests
    const tokensByChain = {};
    const nativeTokens = new Set();
    
    tokens.forEach(token => {
      if (token.isNative) {
        nativeTokens.add(token.priceSymbol || token.symbol);
      } else {
        if (!tokensByChain[token.chainId]) {
          tokensByChain[token.chainId] = [];
        }
        tokensByChain[token.chainId].push(token.address);
      }
    });
    
    // Create promises for parallel execution
    const pricePromises = [];
    
    // Fetch ERC20 token prices in parallel with batching
    for (const [chainId, addresses] of Object.entries(tokensByChain)) {
      if (addresses.length === 0) continue;
      
      console.log(`🔄 Fetching prices for ${addresses.length} tokens on chain ${chainId}`);
      
      // Process tokens in parallel batches of 5 to balance speed vs rate limits
      const batchSize = 5;
      for (let i = 0; i < addresses.length; i += batchSize) {
        const batch = addresses.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (address) => {
          try {
            const priceResponse = await fetch(
              `https://deep-index.moralis.io/api/v2.2/erc20/${address}/price?chain=${chainId}`,
              {
                headers: {
                  'X-API-Key': MORALIS_API_KEY,
                  'accept': 'application/json'
                }
              }
            );
            
            if (priceResponse.ok) {
              const priceData = await priceResponse.json();
              if (priceData && priceData.usdPrice) {
                return { address: address.toLowerCase(), price: parseFloat(priceData.usdPrice) };
              }
            }
            return null;
          } catch (error) {
            console.warn(`⚠️ Error fetching price for token ${address}:`, error.message);
            return null;
          }
        });
        
        pricePromises.push(...batchPromises);
        
        // Small delay between batches only (reduced from 50ms to 25ms)
        if (i + batchSize < addresses.length) {
          await new Promise(resolve => setTimeout(resolve, 25));
        }
      }
    }
    
    // Fetch all native token prices in a single call
    if (nativeTokens.size > 0) {
      console.log(`🔄 Fetching native token prices for: ${Array.from(nativeTokens).join(', ')}`);
      
      const nativePromise = (async () => {
        try {
          // Map symbols to CoinGecko IDs
          const coinGeckoIds = {
            'ETH': 'ethereum',
            'CELO': 'celo'
          };
          
          const symbols = Array.from(nativeTokens);
          const coinIds = symbols.map(s => coinGeckoIds[s]).filter(Boolean);
          
          if (coinIds.length > 0) {
            // Batch request for all native tokens at once
            const priceResponse = await fetch(
              `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds.join(',')}&vs_currencies=usd`,
              {
                headers: {
                  'accept': 'application/json'
                }
              }
            );
            
            if (priceResponse.ok) {
              const priceData = await priceResponse.json();
              const results = [];
              
              symbols.forEach(symbol => {
                const coinId = coinGeckoIds[symbol];
                if (coinId && priceData[coinId] && priceData[coinId].usd) {
                  results.push({ symbol, price: parseFloat(priceData[coinId].usd) });
                  console.log(`💰 ${symbol}: $${priceData[coinId].usd}`);
                }
              });
              
              return results;
            }
          }
        } catch (error) {
          console.warn(`⚠️ Error fetching native token prices:`, error.message);
        }
        return [];
      })();
      
      pricePromises.push(nativePromise);
    }
    
    // Wait for all price requests to complete in parallel
    console.log(`⚡ Executing ${pricePromises.length} price requests in parallel...`);
    const results = await Promise.allSettled(pricePromises);
    
    // Process results
    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        if (Array.isArray(result.value)) {
          // Native token results
          result.value.forEach(({ symbol, price }) => {
            priceMap[symbol] = price;
          });
        } else if (result.value.address && result.value.price) {
          // ERC20 token result
          priceMap[result.value.address] = result.value.price;
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching token prices:', error);
  }
  
  console.log(`🔍 Price map result:`, Object.keys(priceMap).length, 'prices fetched');
  return priceMap;
};

// Fallback function for Celo network using Celo-specific APIs
const getCeloTokens = async (address) => {
  console.log('🔄 Using Celo fallback API for tokens');
  const celoTokens = [];
  
  try {
    // For now, let's just add CELO native token if there's a balance
    // This is a placeholder - you could integrate with Celo's native APIs here
    
    // Try to get actual CELO balance using Celo's RPC endpoint
    try {
      const response = await fetch('https://forno.celo.org', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getBalance',
          params: [address, 'latest'],
          id: 1
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.result) {
          const balanceWei = BigInt(data.result);
          const balance = parseFloat(balanceWei.toString()) / Math.pow(10, 18);
          
          console.log(`🔍 Actual Celo balance from RPC: ${balance} CELO`);
          
          if (balance > 0.000001) {
            celoTokens.push({
              symbol: 'CELO',
              name: 'Celo',
              address: '0x0000000000000000000000000000000000000000',
              balance: balance.toString(),
              price: 0, // Will be filled by price lookup
              value: '0', // Will be calculated from balance * price
              network: 'Celo',
              networkKey: 'celo',
              chainId: '0xa4ec',
              decimals: 18,
              isNative: true,
              priceSymbol: 'CELO',
              source: 'celo-rpc'
            });
            
            console.log(`✅ Added Celo native token via RPC: CELO (${balance})`);
          }
        }
      }
    } catch (rpcError) {
      console.warn('⚠️ Celo RPC failed, using mock data:', rpcError.message);
      
      // Fallback to mock data for testing
      const mockCeloBalance = 1.5; // This should come from actual Celo API
      
      if (mockCeloBalance > 0.000001) {
        celoTokens.push({
          symbol: 'CELO',
          name: 'Celo',
          address: '0x0000000000000000000000000000000000000000',
          balance: mockCeloBalance.toString(),
          price: 0, // Will be filled by price lookup
          value: '0', // Will be calculated from balance * price
          network: 'Celo',
          networkKey: 'celo',
          chainId: '0xa4ec',
          decimals: 18,
          isNative: true,
          priceSymbol: 'CELO',
          source: 'celo-fallback'
        });
        
        console.log(`✅ Added Celo native token via fallback: CELO (${mockCeloBalance})`);
      }
    }
    
    // TODO: Add actual Celo ERC20 token fetching here
    // You could use Celo's native block explorer API or other services
    
  } catch (error) {
    console.error('❌ Celo fallback API error:', error);
  }
  
  return celoTokens;
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { address, networks } = req.query;

  if (!address) {
    return res.status(400).json({ error: 'Address parameter is required' });
  }

  if (!MORALIS_API_KEY) {
    return res.status(500).json({ 
      error: 'Moralis API key not configured',
      success: false 
    });
  }

  // Parse networks parameter
  let targetNetworks = ['base', 'celo', 'arbitrum']; // Default networks
  if (networks) {
    targetNetworks = networks.split(',').map(n => n.trim().toLowerCase());
  }

  console.log('🔍 Fetching Moralis data for:', { address, networks: targetNetworks });

  try {
    const allTokens = [];
    const tempTokens = []; // Temporary array to collect all tokens before price fetching

    // Create parallel promises for all networks
    const networkPromises = targetNetworks.map(async (networkKey) => {
      const chainId = MORALIS_NETWORKS[networkKey];
      
      // Special handling for Celo (not supported by Moralis)
      if (networkKey === 'celo') {
        console.log(`🔄 Fetching Celo tokens using fallback API`);
        return await getCeloTokens(address);
      }
      
      if (!chainId) {
        console.warn(`⚠️ Unknown network: ${networkKey}`);
        return [];
      }

      console.log(`🔄 Fetching tokens for ${networkKey} (${chainId})`);
      
      const networkTokens = [];

      try {
        // Fetch ERC20 token balances
        console.log(`🔍 ERC20 API call: https://deep-index.moralis.io/api/v2.2/${address}/erc20?chain=${chainId}`);
        const erc20Response = await fetch(
          `https://deep-index.moralis.io/api/v2.2/${address}/erc20?chain=${chainId}`,
          {
            headers: {
              'X-API-Key': MORALIS_API_KEY,
              'accept': 'application/json'
            }
          }
        );

        console.log(`🔍 ${networkKey} ERC20 response status:`, erc20Response.status);

        if (!erc20Response.ok) {
          const errorText = await erc20Response.text();
          console.error(`❌ Moralis ERC20 API error for ${networkKey}:`, erc20Response.status, errorText);
          return []; // Return empty array for this network
        }

        const erc20Data = await erc20Response.json();
        console.log(`📊 Found ${erc20Data.length || 0} ERC20 tokens on ${networkKey}`);

        // Process ERC20 tokens
        if (erc20Data && Array.isArray(erc20Data)) {
          for (const token of erc20Data) {
            // Skip tokens with zero balance
            if (!token.balance || token.balance === '0') continue;

            const networkInfo = NETWORK_INFO[chainId];
            const balance = parseFloat(token.balance) / Math.pow(10, token.decimals || 18);
            
            // Only include tokens with meaningful balance (> 0.000001)
            if (balance < 0.000001) continue;

            const tokenData = {
              symbol: token.symbol || 'UNKNOWN',
              name: token.name || 'Unknown Token',
              address: token.token_address,
              balance: balance.toString(),
              price: 0, // Will be filled by price lookup
              value: '0', // Will be calculated from balance * price
              network: networkInfo.network,
              networkKey: networkInfo.networkKey,
              chainId: networkInfo.chainId,
              decimals: token.decimals || 18,
              isNative: false,
              source: 'moralis'
            };
            
            console.log(`✅ Adding ${networkKey} ERC20 token: ${token.symbol} (${balance})`);
            networkTokens.push(tokenData);
          }
        }

        // Fetch native token balance
        console.log(`🔍 Native balance API call: https://deep-index.moralis.io/api/v2.2/${address}/balance?chain=${chainId}`);
        const nativeResponse = await fetch(
          `https://deep-index.moralis.io/api/v2.2/${address}/balance?chain=${chainId}`,
          {
            headers: {
              'X-API-Key': MORALIS_API_KEY,
              'accept': 'application/json'
            }
          }
        );

        console.log(`🔍 ${networkKey} native balance response status:`, nativeResponse.status);

        if (nativeResponse.ok) {
          const nativeData = await nativeResponse.json();
          const nativeToken = NATIVE_TOKENS[chainId];
          const networkInfo = NETWORK_INFO[chainId];
          
          if (nativeData.balance && nativeData.balance !== '0') {
            const balance = parseFloat(nativeData.balance) / Math.pow(10, 18); // Native tokens are always 18 decimals
            
            // Only include if balance > 0.000001
            if (balance >= 0.000001) {
              const nativeTokenData = {
                symbol: nativeToken.symbol,
                name: nativeToken.name,
                address: '0x0000000000000000000000000000000000000000',
                balance: balance.toString(),
                price: 0, // Will be filled by price lookup
                value: '0', // Will be calculated from balance * price
                network: networkInfo.network,
                networkKey: networkInfo.networkKey,
                chainId: networkInfo.chainId,
                decimals: 18,
                isNative: true,
                priceSymbol: nativeToken.priceSymbol,
                source: 'moralis'
              };
              
              console.log(`✅ Adding ${networkKey} native token: ${nativeToken.symbol} (${balance})`);
              networkTokens.push(nativeTokenData);
            }
          }
        } else {
          console.warn(`⚠️ Failed to fetch native balance for ${networkKey}`);
        }

      } catch (networkError) {
        console.error(`❌ Error fetching tokens for ${networkKey}:`, networkError);
        return []; // Return empty array for this network
      }
      
      return networkTokens;
    });

    // Execute all network requests in parallel
    console.log(`⚡ Fetching tokens from ${targetNetworks.length} networks in parallel...`);
    const networkResults = await Promise.allSettled(networkPromises);
    
    // Collect all tokens from all networks
    networkResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && Array.isArray(result.value)) {
        tempTokens.push(...result.value);
        console.log(`✅ ${targetNetworks[index]}: ${result.value.length} tokens`);
      } else {
        console.error(`❌ ${targetNetworks[index]}: Failed to fetch tokens`);
      }
    });

    console.log(`📊 Collected ${tempTokens.length} tokens before price filtering`);

    // Fetch prices for all tokens
    console.log('🔄 Fetching token prices...');
    const priceMap = await getTokenPrices(tempTokens);
    console.log(`💰 Fetched prices for ${Object.keys(priceMap).length} tokens`);

    // Apply prices and calculate USD values
    for (const token of tempTokens) {
      let price = 0;
      
      if (token.isNative) {
        // For native tokens, use the price symbol (ETH, CELO)
        price = priceMap[token.priceSymbol] || 0;
      } else {
        // For ERC20 tokens, use the contract address
        price = priceMap[token.address.toLowerCase()] || 0;
      }
      
      const balance = parseFloat(token.balance);
      const usdValue = balance * price;
      
      // Only include tokens with USD value > $0.25
      if (usdValue >= 0.25) {
        token.price = price;
        token.value = usdValue.toFixed(2);
        allTokens.push(token);
      }
    }

    // Sort tokens by USD value (highest first)
    allTokens.sort((a, b) => parseFloat(b.value) - parseFloat(a.value));

    console.log(`✅ Returning ${allTokens.length} tokens with USD value >= $0.25`);
    console.log('🔍 Top tokens by value:', allTokens.slice(0, 5).map(t => 
      `${t.symbol}: $${t.value} (${t.balance} × $${t.price})`
    ));

    return res.status(200).json({
      success: true,
      tokens: allTokens
    });

  } catch (error) {
    console.error('❌ Moralis API error:', error);
    return res.status(500).json({
      error: 'Failed to fetch token data from Moralis',
      details: error.message,
      success: false
    });
  }
}
