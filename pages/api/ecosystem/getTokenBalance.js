import { initializeMoralis } from "../../../utils/utils";
import { EvmChain } from '@moralisweb3/common-evm-utils';

export default async function handler(req, res) {
  const { walletAddress, tokenAddress } = req.query;

  if (!walletAddress || !tokenAddress) {
    return res.status(400).json({ error: 'Wallet address and token address are required' });
  }

  await initializeMoralis();

  const chain = EvmChain.ETHEREUM;

  try {
    const response = await Moralis.EvmApi.token.getWalletTokenBalances({
      address: walletAddress,
      chain,
    });

    const tokenBalance = response.toJSON().find(token => token.token_address.toLowerCase() === tokenAddress.toLowerCase());

    const balanceString = tokenBalance ? tokenBalance.balance : '0';

    res.status(200).json({ balance: balanceString });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching the token balance' });
  }
}