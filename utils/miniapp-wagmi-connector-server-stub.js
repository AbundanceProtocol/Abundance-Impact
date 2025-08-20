// Server-side stub for @farcaster/miniapp-wagmi-connector
// This prevents ESM import errors during SSR

// Return a factory function as expected by Wagmi v2
export function farcasterMiniApp() {
  return {
    id: 'farcaster-miniapp-stub',
    name: 'Farcaster Mini App (Server Stub)',
    type: 'farcasterMiniApp',
    async connect() {
      throw new Error('Farcaster Mini App connector cannot be used on server side');
    },
    async disconnect() {},
    async getAccount() {
      throw new Error('Farcaster Mini App connector cannot be used on server side');
    },
    async getChainId() {
      return 1; // Default to mainnet
    },
    async isAuthorized() {
      return false;
    },
    async switchChain() {
      throw new Error('Farcaster Mini App connector cannot be used on server side');
    },
    onAccountsChanged() {},
    onChainChanged() {},
    onConnect() {},
    onDisconnect() {},
    onMessage() {}
  };
}
