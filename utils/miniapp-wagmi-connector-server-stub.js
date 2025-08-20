// SSR-safe stub for @farcaster/miniapp-wagmi-connector
// Exposes a minimal connector factory compatible with Wagmi v2 expectations.

export function farcasterMiniApp() {
	// Return a factory function, which Wagmi will call to get the connector instance
	return function createFarcasterConnector() {
		return {
			id: 'farcaster-miniapp-stub',
			name: 'Farcaster Mini App (stub)',
			type: 'stub',
			// Minimal async methods so SSR does not crash if called
			connect: async () => ({ account: undefined, chain: undefined, provider: null }),
			disconnect: async () => {},
			getAccount: async () => null,
			getChainId: async () => null,
			getProvider: async () => null,
			onAccountsChanged: () => {},
			onChainChanged: () => {},
			onDisconnect: () => {},
		};
	};
}

export default { farcasterMiniApp };


