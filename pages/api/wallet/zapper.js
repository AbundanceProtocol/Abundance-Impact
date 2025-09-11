import { ApolloClient, InMemoryCache, createHttpLink, gql } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Set up Apollo Client for Zapper API
const httpLink = createHttpLink({
  uri: 'https://public.zapper.xyz/graphql',
});

const zapperApiKey = process.env.ZAPPER_API_KEY;

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      'x-zapper-api-key': zapperApiKey,
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

// GraphQL query for portfolio data
const PortfolioV2Query = gql`
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
              address
              network
              decimals
              price {
                value
                currency
              }
            }
          }
        }
      }
    }
  }
`;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { address, networks } = req.query;

  if (!address) {
    return res.status(400).json({ error: 'Address parameter is required' });
  }

  // Check if API key is available
  if (!zapperApiKey) {
    return res.status(500).json({ 
      success: false,
      error: 'Zapper API key not configured',
      details: 'Please set ZAPPER_API_KEY environment variable'
    });
  }

  // Default to Base and Celo if no networks specified
  const defaultNetworks = ['BASE', 'CELO'];
  const requestedNetworks = networks ? networks.split(',') : defaultNetworks;

  // Map network names to Zapper format
  const networkMap = {
    'base': 'BASE',
    'celo': 'CELO',
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

    const { data } = await client.query({
      query: PortfolioV2Query,
      variables: {
        addresses: [address],
        networks: zapperNetworks,
      },
    });

    console.log('✅ Zapper API response received');

    // Transform the data to match your existing format
    const tokens = data.portfolioV2.tokenBalances.byToken.edges.map(edge => {
      const node = edge.node;
      
      // Map Zapper network names back to your format
      const networkMap = {
        'BASE': { network: 'Base', networkKey: 'base', chainId: '0x2105' },
        'CELO': { network: 'Celo', networkKey: 'celo', chainId: '0xa4ec' },
        'ETHEREUM_MAINNET': { network: 'Ethereum', networkKey: 'ethereum', chainId: '0x1' },
        'POLYGON_MAINNET': { network: 'Polygon', networkKey: 'polygon', chainId: '0x89' },
        'ARBITRUM_MAINNET': { network: 'Arbitrum', networkKey: 'arbitrum', chainId: '0xa4b1' },
        'OPTIMISM_MAINNET': { network: 'Optimism', networkKey: 'optimism', chainId: '0xa' }
      };

      const networkInfo = networkMap[node.network] || { 
        network: node.network, 
        networkKey: node.network.toLowerCase(), 
        chainId: '0x0' 
      };

      return {
        symbol: node.symbol,
        name: node.name,
        address: node.address,
        balance: node.balance.toString(),
        price: node.price?.value || 0,
        value: node.balanceUSD.toString(),
        network: networkInfo.network,
        networkKey: networkInfo.networkKey,
        chainId: networkInfo.chainId,
        decimals: node.decimals || 18,
        isNative: node.address === '0x0000000000000000000000000000000000000000',
        source: 'zapper'
      };
    });

    console.log(`📊 Found ${tokens.length} tokens from Zapper API`);

    return res.status(200).json({
      success: true,
      tokens: tokens,
      count: tokens.length,
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
