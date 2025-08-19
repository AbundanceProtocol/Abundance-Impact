// SSR-safe stub for @farcaster/miniapp-sdk
export const sdk = {
  isInMiniApp: async () => false,
  get context() {
    return Promise.resolve({ user: null, client: {} });
  },
  actions: {
    ready: async () => {},
    composeCast: async () => {},
    addMiniApp: async () => ({}),
    viewCast: async () => {},
  },
  haptics: {
    impactOccurred: async () => {},
  },
};

export default { sdk };


