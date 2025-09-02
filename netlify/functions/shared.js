
import axios from "axios";

// Environment variables
const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
const NEYNAR_BASE_URL = 'https://api.neynar.com/v2/farcaster';

/**
 * Fetch a webhook from Neynar API
 * @param {string} webhookId - The webhook ID to fetch
 * @returns {Promise<Object>} The webhook data
 */
async function fetchWebhook(webhookId) {
  try {
    if (!NEYNAR_API_KEY) {
      throw new Error('NEYNAR_API_KEY environment variable is required');
    }

    if (!webhookId) {
      throw new Error('webhook_id is required');
    }

    const response = await axios.get(`${NEYNAR_BASE_URL}/webhook/`, {
      headers: {
        'x-api-key': NEYNAR_API_KEY,
        'Content-Type': 'application/json'
      },
      params: {
        webhook_id: webhookId
      }
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      // API error response
      throw new Error(`Neynar API Error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
    } else if (error.request) {
      // Network error
      throw new Error('Network error: Unable to reach Neynar API');
    } else {
      // Other error
      throw new Error(`Error fetching webhook: ${error.message}`);
    }
  }
}

/**
 * List all webhooks for the authenticated user
 * @returns {Promise<Object>} The webhooks list
 */
async function listWebhooks() {
  try {
    if (!NEYNAR_API_KEY) {
      throw new Error('NEYNAR_API_KEY environment variable is required');
    }

    const response = await axios.get(`${NEYNAR_BASE_URL}/webhook/`, {
      headers: {
        'x-api-key': NEYNAR_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`Neynar API Error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
    } else if (error.request) {
      throw new Error('Network error: Unable to reach Neynar API');
    } else {
      throw new Error(`Error listing webhooks: ${error.message}`);
    }
  }
}

export const handler = async (event) => {
  try {
    // Parse the request
    const { httpMethod, queryStringParameters, body } = event;
    
    console.log('🔍 Shared function called:', httpMethod, queryStringParameters);

    // Handle different HTTP methods
    switch (httpMethod) {
      case 'GET':
        const { webhook_id } = queryStringParameters || {};
        
        if (webhook_id) {
          // Fetch specific webhook
          console.log('📡 Fetching webhook:', webhook_id);
          const webhookData = await fetchWebhook(webhook_id);
          
          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': 'Content-Type',
              'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
            },
            body: JSON.stringify({
              success: true,
              data: webhookData
            })
          };
        } else {
          // List all webhooks
          console.log('📋 Listing all webhooks');
          const webhooksData = await listWebhooks();
          
          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': 'Content-Type',
              'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
            },
            body: JSON.stringify({
              success: true,
              data: webhooksData
            })
          };
        }

      case 'OPTIONS':
        // Handle CORS preflight requests
        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
          },
          body: ''
        };

      default:
        return {
          statusCode: 405,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            success: false,
            error: 'Method not allowed'
          })
        };
    }

  } catch (error) {
    console.error('❌ Error in shared function:', error.message);
    
    return {
      statusCode: error.message.includes('401') ? 401 : 
                  error.message.includes('404') ? 404 : 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
