// SSR-safe stub returning a Wagmi v2-compatible connector factory
// Wagmi expects `connectors` to be an array of functions (factories) that receive
// `{ emitter, chains, storage, transports }` and return a connector object.
export function farcasterMiniApp() {
  return ({ emitter, chains }) => ({
    id: 'farcaster-miniapp-stub',
    name: 'Farcaster Mini App (SSR Stub)',
    type: 'app',
    rdns: undefined,
    setup: () => {},
    connect: async () => ({
      accounts: [],
      chainId: chains?.[0]?.id ?? 1,
    }),
    disconnect: async () => {},
    getProvider: async () => null,
    onAccountsChanged: () => {},
    onChainChanged: () => {},
    onDisconnect: () => {},
  });
}

export default { farcasterMiniApp };


