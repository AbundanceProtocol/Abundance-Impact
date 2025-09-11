// Simple Zapper API implementation without Apollo Client
// This is a fallback in case Apollo Client dependencies are not installed

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { address, networks } = req.query;

  if (!address) {
    return res.status(400).json({ error: 'Address parameter is required' });
  }

  const zapperApiKey = process.env.ZAPPER_API_KEY;

  // Check if API key is available
  if (!zapperApiKey) {
    return res.status(500).json({ 
      success: false,
      error: 'Zapper API key not configured',
      details: 'Please set ZAPPER_API_KEY environment variable'
    });
  }

  // Default to Base and Celo if no networks specified
  const defaultNetworks = ['BASE_MAINNET', 'CELO_MAINNET'];
  const requestedNetworks = networks ? networks.split(',') : defaultNetworks;

  // Map network names to Zapper format
  const networkMap = {
    'base': 'BASE_MAINNET',
    'celo': 'CELO_MAINNET',
    'ethereum': 'ETHEREUM_MAINNET',
    'polygon': 'POLYGON_MAINNET',
    'arbitrum': 'ARBITRUM_MAINNET',
    'optimism': 'OPTIMISM_MAINNET'
  };

  const zapperNetworks = requestedNetworks.map(network => 
    networkMap[network.toLowerCase()] || network.toUpperCase()
  );

  try {
    console.log('🔍 Fetching Zapper data for:', { address, networks: zapperNetworks });
    console.log('🔍 Using API key:', zapperApiKey ? 'Present' : 'Missing');

    // Use the correct Zapper GraphQL query structure
    const query = `
      query PortfolioV2($addresses: [Address!]!, $networks: [Network!]) {
        portfolioV2(addresses: $addresses, networks: $networks) {
          tokenBalances {
            byToken {
              edges {
                node {
                  balance
                  balanceRaw
                  balanceUSD
                  symbol
                  name
                  tokenAddress
                  network {
                    id
                    name
                  }
                  decimals
                  price
                  imgUrl
                  imgUrlV2
                }
              }
            }
          }
        }
      }
    `;

    const requestBody = {
      query,
      variables: {
        addresses: [address],
        networks: zapperNetworks,
      },
    };

    console.log('🔍 Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch('https://public.zapper.xyz/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-zapper-api-key': zapperApiKey,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('🔍 Response status:', response.status);
    console.log('🔍 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error(`Zapper API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('🔍 Response data:', JSON.stringify(data, null, 2));

    if (data.errors) {
      console.error('❌ GraphQL errors:', data.errors);
      throw new Error(`GraphQL errors: ${data.errors.map(e => e.message).join(', ')}`);
    }

    console.log('✅ Zapper API response received');

    // Check if we have the expected data structure
    if (!data.data || !data.data.portfolioV2 || !data.data.portfolioV2.tokenBalances || !data.data.portfolioV2.tokenBalances.byToken) {
      console.warn('⚠️ Unexpected data structure from Zapper API:', data);
      return res.status(200).json({
        success: true,
        tokens: [],
        count: 0,
        networks: zapperNetworks,
        message: 'No token data available from Zapper API'
      });
    }

    // Transform the data to match your existing format
    const tokens = data.data.portfolioV2.tokenBalances.byToken.edges.map(edge => {
      const token = edge.node;
      // Map Zapper network names back to your format
      const networkMap = {
        'BASE': { network: 'Base', networkKey: 'base', chainId: '0x2105' },
        'CELO': { network: 'Celo', networkKey: 'celo', chainId: '0xa4ec' },
        'ETHEREUM_MAINNET': { network: 'Ethereum', networkKey: 'ethereum', chainId: '0x1' },
        'POLYGON_MAINNET': { network: 'Polygon', networkKey: 'polygon', chainId: '0x89' },
        'ARBITRUM_MAINNET': { network: 'Arbitrum', networkKey: 'arbitrum', chainId: '0xa4b1' },
        'OPTIMISM_MAINNET': { network: 'Optimism', networkKey: 'optimism', chainId: '0xa' },
        // Add numeric mappings for Zapper API
        '16': { network: 'Base', networkKey: 'base', chainId: '0x2105' },
        '42220': { network: 'Celo', networkKey: 'celo', chainId: '0xa4ec' },
        '1': { network: 'Ethereum', networkKey: 'ethereum', chainId: '0x1' },
        '137': { network: 'Polygon', networkKey: 'polygon', chainId: '0x89' },
        '42161': { network: 'Arbitrum', networkKey: 'arbitrum', chainId: '0xa4b1' },
        '10': { network: 'Optimism', networkKey: 'optimism', chainId: '0xa' },
        // Add more possible numeric mappings
        '8453': { network: 'Base', networkKey: 'base', chainId: '0x2105' },
        '42220': { network: 'Celo', networkKey: 'celo', chainId: '0xa4ec' }
      };

      const networkId = String(token.network?.id || 'unknown');
      console.log('🔍 Zapper token network debug:', {
        networkId,
        networkName: token.network?.name,
        symbol: token.symbol,
        address: token.tokenAddress,
        imgUrl: token.imgUrl,
        imgUrlV2: token.imgUrlV2
      });
      
      let networkInfo = networkMap[networkId] || { 
        network: token.network?.name || 'Unknown', 
        networkKey: networkId.toLowerCase(), 
        chainId: '0x0' 
      };
      
      // Special fallback for Celo tokens - ensure they get Celo network mapping
      if (token.symbol === 'CELO' || token.symbol === 'USDGLO' || 
          (token.network?.name && token.network.name.toLowerCase().includes('celo'))) {
        networkInfo = {
          network: 'Celo',
          networkKey: 'celo',
          chainId: '0xa4ec'
        };
        console.log('🔍 Overriding network info for Celo token:', networkInfo);
      }
      
      console.log('🔍 Mapped network info:', networkInfo);
      
      // Special handling for Celo tokens
      if (token.symbol === 'CELO' || token.symbol === 'USDGLO' || networkInfo.networkKey === 'celo') {
        console.log('🔍 CELO token detected, ensuring correct network mapping:', {
          symbol: token.symbol,
          networkId,
          networkInfo,
          isCelo: networkInfo.networkKey === 'celo'
        });
      }

      return {
        symbol: token.symbol,
        name: token.name,
        address: token.tokenAddress,
        balance: token.balance?.toString() || '0',
        price: token.price || 0,
        value: token.balanceUSD?.toString() || '0',
        network: networkInfo.network,
        networkKey: networkInfo.networkKey,
        chainId: networkInfo.chainId,
        decimals: token.decimals || 18,
        isNative: token.tokenAddress === '0x0000000000000000000000000000000000000000',
        logo: token.imgUrl || token.imgUrlV2 || null,
        source: 'zapper'
      };
    });

    // Filter tokens with USD value > $0.40
    const filteredTokens = tokens.filter(token => {
      const usdValue = parseFloat(token.value) || 0;
      const shouldInclude = usdValue > 0.4;
      
      if (!shouldInclude) {
        console.log(`🚫 Filtered out ${token.symbol}: $${usdValue} (below $0.40 threshold)`);
      }
      
      return shouldInclude;
    });

    // Remove duplicates based on symbol and network
    const uniqueTokens = filteredTokens.reduce((acc, token) => {
      const key = `${token.symbol}-${token.networkKey}`;
      const existing = acc.find(t => `${t.symbol}-${t.networkKey}` === key);
      
      if (!existing) {
        acc.push(token);
        console.log(`✅ Added unique token: ${token.symbol} (${token.network})`);
      } else {
        // Keep the token with higher USD value
        const existingValue = parseFloat(existing.value) || 0;
        const currentValue = parseFloat(token.value) || 0;
        
        if (currentValue > existingValue) {
          const index = acc.indexOf(existing);
          acc[index] = token;
          console.log(`🔄 Replaced ${token.symbol} (${token.network}) with higher value: $${currentValue} > $${existingValue}`);
        } else {
          console.log(`⚠️ Skipped duplicate ${token.symbol} (${token.network}) with lower value: $${currentValue} <= $${existingValue}`);
        }
      }
      
      return acc;
    }, []);

    console.log(`📊 Found ${tokens.length} tokens from Zapper API`);
    console.log(`📊 After filtering (>$0.40): ${filteredTokens.length} tokens`);
    console.log(`📊 After deduplication: ${uniqueTokens.length} tokens`);

    return res.status(200).json({
      success: true,
      tokens: uniqueTokens,
      count: uniqueTokens.length,
      networks: zapperNetworks
    });

  } catch (error) {
    console.error('❌ Zapper API error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch token data from Zapper API',
      details: error.message
    });
  }
}
