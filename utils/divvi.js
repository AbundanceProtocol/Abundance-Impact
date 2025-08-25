import { getReferralTag, submitReferral } from '@divvi/referral-sdk';

/**
 * Divvi Referral Integration Utility
 * 
 * This utility handles referral tracking for the tipping system using the Divvi referral SDK.
 * It supports both on-chain transaction referrals and off-chain signed message referrals.
 */

// Consumer address for the tipping application
const CONSUMER_ADDRESS = '0xdca6F7CB3cF361C8dF8FDE119370F1b21b2fFf63'; 

/**
 * Generate referral tag for on-chain transactions
 * @param {string} userAddress - The user's wallet address making the transaction
 * @returns {string} - Hex string containing referral metadata
 */
export const generateReferralTag = (userAddress) => {
  try {
    if (!userAddress) {
      console.warn('Divvi: No user address provided for referral tag generation');
      return '';
    }

    const referralTag = getReferralTag({
      user: userAddress,
      consumer: CONSUMER_ADDRESS,
    });

    console.log('Divvi: Generated referral tag:', referralTag);
    return referralTag;
  } catch (error) {
    console.error('Divvi: Error generating referral tag:', error);
    return '';
  }
};

/**
 * Submit on-chain transaction referral to Divvi
 * @param {string} txHash - Transaction hash
 * @param {string|number} chainId - Chain ID (hex or decimal)
 * @returns {Promise<boolean>} - Success status
 */
export const submitOnChainReferral = async (txHash, chainId) => {
  try {
    if (!txHash || !chainId) {
      console.warn('Divvi: Missing txHash or chainId for on-chain referral submission');
      return false;
    }

    // Convert chainId to hex if it's decimal
    const hexChainId = typeof chainId === 'number' ? `0x${chainId.toString(16)}` : chainId;

    console.log('Divvi: Submitting on-chain referral:', { txHash, chainId: hexChainId });

    await submitReferral({
      txHash,
      chainId: hexChainId,
    });

    console.log('Divvi: On-chain referral submitted successfully');
    return true;
  } catch (error) {
    console.error('Divvi: Error submitting on-chain referral:', error);
    return false;
  }
};

/**
 * Submit off-chain signed message referral to Divvi
 * @param {string} userAddress - User's wallet address
 * @param {string} message - Signed message content
 * @param {string} signature - Message signature
 * @param {string|number} chainId - Chain ID
 * @returns {Promise<boolean>} - Success status
 */
export const submitOffChainReferral = async (userAddress, message, signature, chainId) => {
  try {
    if (!userAddress || !message || !signature || !chainId) {
      console.warn('Divvi: Missing required parameters for off-chain referral submission');
      return false;
    }

    // Convert chainId to hex if it's decimal
    const hexChainId = typeof chainId === 'number' ? `0x${chainId.toString(16)}` : chainId;

    console.log('Divvi: Submitting off-chain referral:', { 
      userAddress, 
      messageLength: message.length, 
      signatureLength: signature.length, 
      chainId: hexChainId 
    });

    await submitReferral({
      message,
      signature,
      chainId: hexChainId,
    });

    console.log('Divvi: Off-chain referral submitted successfully');
    return true;
  } catch (error) {
    console.error('Divvi: Error submitting off-chain referral:', error);
    return false;
  }
};

/**
 * Create a referral message for off-chain signing
 * @param {string} userAddress - User's wallet address
 * @param {string} referralTag - Generated referral tag
 * @param {Object} tipData - Tip transaction data
 * @returns {string} - Message to be signed
 */
export const createReferralMessage = (userAddress, referralTag, tipData) => {
  const timestamp = Date.now();
  const message = `Divvi Referral Attribution

Referral Tag: ${referralTag}
User Address: ${userAddress}
Tip Amount: ${tipData.amount} ${tipData.token}
Recipients: ${tipData.recipientsCount}
Timestamp: ${timestamp}
Transaction Type: Multi-Tip Disperse

I consent to this referral attribution being tracked by Divvi.`;

  return message;
};

/**
 * Get referral tag with data suffix for transaction data
 * @param {string} userAddress - User's wallet address
 * @returns {string} - Referral tag with 0x prefix for transaction data
 */
export const getReferralDataSuffix = (userAddress) => {
  const tag = generateReferralTag(userAddress);
  return tag ? `0x${tag}` : '';
};

export default {
  generateReferralTag,
  submitOnChainReferral,
  submitOffChainReferral,
  createReferralMessage,
  getReferralDataSuffix,
};
