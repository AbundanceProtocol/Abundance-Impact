const tokenAPI = process.env.TOKEN_API;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ error: 'Wallet address is required' });
  }

  try {
    console.log('🔄 Proxying API request for address:', address);
    
    // Call API from server-side (no CORS issues)
    const response = await fetch(`${tokenAPI}/${address}`);
    
    if (!response.ok) {
      console.error('❌ API error:', response.status, response.statusText);
      return res.status(response.status).json({ 
        error: `API error: ${response.status} ${response.statusText}` 
      });
    }
    
    const data = await response.json();
    console.log('✅ API response received:', {
      success: data.success,
      tokenCount: data.tokens?.length || 0,
      totalCount: data.totalCount
    });
    
    // Return the data directly
    res.status(200).json(data);
    
  } catch (error) {
    console.error('❌ Proxy error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch wallet data',
      details: error.message 
    });
  }
}
