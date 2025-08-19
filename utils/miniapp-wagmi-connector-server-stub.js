export function farcasterMiniApp() {
  return {
    id: 'farcaster-miniapp-stub',
    name: 'Farcaster Mini App (SSR Stub)',
    type: 'app',
    connect: async () => ({ account: null }),
    disconnect: async () => {},
    getProvider: async () => null,
    onAccountsChanged: () => {},
    onChainChanged: () => {},
    onDisconnect: () => {},
  };
}

export default { farcasterMiniApp };


