// utils/miniapp-sdk-server-stub.js
// SSR-safe no-op stub for @farcaster/miniapp-sdk
const logOnce = () => {
  try {
    if (!globalThis.__loggedMiniAppSdkImport) {
      globalThis.__loggedMiniAppSdkImport = true;
      // eslint-disable-next-line no-console
      console.warn('SSR attempted to import @farcaster/miniapp-sdk (using stub).');
    }
  } catch (_) {}
};

export const sdk = {
  isInMiniApp: async () => { logOnce(); return false; },
  context: Promise.resolve({ user: null, client: {} }),
  actions: { ready: () => { logOnce(); }, addMiniApp: async () => ({}), addFrame: async () => ({}) },
  haptics: { impact: async () => { logOnce(); } },
};

export default { sdk };
